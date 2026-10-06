export class CompletionStreamError extends Error {
  constructor(public reason: string, message: string) { super(message); this.name = 'CompletionStreamError'; }
}

/** Yield the last delta before reporting a cutoff, so no received text is lost. */
export interface CompletionUsage { promptTokens?: number; completionTokens?: number; reasoningTokens?: number }

/**
 * 解析模型的流式输出。
 *
 * 关于推理模型的思考内容：本项目约定 **不把思考正文写进回复正文，也不落库**
 * （见 docs/会话引擎升级说明.md：「服务未提供的数据显示未提供……也不保存思考正文」）。
 * 因此这里只把思考内容的“长度”通过 onReasoning 上报，供界面显示思考进度，
 * 正文流里始终只有 content，避免思考文本被当作剧情正文持久化。
 */
export async function* streamCompletion(
  body: ReadableStream<Uint8Array>,
  onFinish?: (reason: string) => void,
  onUsage?: (usage: CompletionUsage) => void,
  onReasoning?: (chars: number) => void
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;
  let receivedFinishReason = false;
  let reasoningChars = 0;
  function parseEvent(event: string): { done: boolean; text?: string; error?: Error } {
    const data = event.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n');
    if (!data) return { done: false };
    if (data.trim() === '[DONE]') return { done: true };
    const value = JSON.parse(data);
    if (value.usage && onUsage) {
      const count = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : undefined;
      onUsage({promptTokens:count(value.usage.prompt_tokens),completionTokens:count(value.usage.completion_tokens),reasoningTokens:count(value.usage.completion_tokens_details?.reasoning_tokens)});
    }
    if (value.error) throw new Error(value.error.message || '模型流返回错误');
    const reason = value.choices?.[0]?.finish_reason;
    let error: Error | undefined;
    if (typeof reason === 'string' && reason) {
      receivedFinishReason = true;
      onFinish?.(reason);
      if (reason === 'length' || reason === 'max_tokens') error = new CompletionStreamError('length', '模型报告回复达到长度上限。请在会话工作台提高回复上限，或缩短回复篇幅后重新生成。');
      else if (reason === 'content_filter') error = new CompletionStreamError('content_filter', '模型服务中止了本次输出（内容过滤），这不是长度上限。');
      else if (reason !== 'stop') error = new CompletionStreamError(reason, '模型返回了非正文结束状态，本次回复未完成。');
    }
    const delta = value.choices?.[0]?.delta;
    // 推理模型的思考增量：只累计长度用于进度提示，不进入正文流
    if (typeof delta?.reasoning_content === 'string' && delta.reasoning_content) {
      reasoningChars += delta.reasoning_content.length;
      onReasoning?.(reasoningChars);
    }
    if (delta?.content != null && typeof delta.content !== 'string') throw new Error('模型返回了不支持的消息格式');
    return { done: false, text: typeof delta?.content === 'string' ? delta.content : undefined, error };
  }
  try {
    while (!finished) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      // Normalize complete CRLFs only; a trailing CR may belong to the next chunk.
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const result = parseEvent(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (result.text) yield result.text;
        if (result.error) throw result.error;
        if (result.done) { finished = true; break; }
      }
      if (done) {
        if (!finished && buffer.trim()) {
          const result = parseEvent(buffer);
          if (result.text) yield result.text;
          if (result.error) throw result.error;
          if (result.done) finished = true;
        }
        if (!finished && !receivedFinishReason) throw new CompletionStreamError('connection_closed', '连接提前结束，回复未完成。已保留收到的文字，可以重新生成。');
        finished = true;
      }
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
