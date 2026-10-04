/** Classify provider errors without exposing echoed credentials or story text. */
export type ImageFailureStage = 'upstream' | 'proxy';
export function imageFailure(status: number, detail: string, stage: ImageFailureStage = 'upstream') {
  const value = detail.slice(0, 32768);
  let code = 'unavailable';
  let message = '生图服务暂时未能完成请求，请稍后重试；持续失败时请查看生图网关日志。';
  if (/content[_ -]?filter|safety|blocked|prohibited|moderation|policy violation|内容审核|安全策略|违反.*政策/i.test(value)) {
    code = 'rejected'; message = '生图服务因内容或安全策略拒绝了这次请求，修改连接地址或密钥不能解决这类拒绝。';
  } else if (/quota|insufficient[_ -]?(credit|balance)|billing|余额|额度不足/i.test(value)) {
    code = 'quota'; message = '生图服务报告额度或账户余额不足，请检查生图服务账户。';
  } else if (status === 429 || /rate[_ -]?limit|too many requests|限流/i.test(value)) {
    code = 'rate_limit'; message = '生图服务请求过于频繁，请等待一段时间再试。';
  } else if (status === 401 || status === 403 || /invalid[_ -]?(api[_ -]?)?key|unauthorized|authentication/i.test(value)) {
    code = 'auth'; message = '生图鉴权或访问权限校验失败，请检查已应用的密钥与站点访问状态。刷新页面后需重新填写生图密钥。';
  } else if (/model[_ -]?not[_ -]?found|unknown model|unsupported model|模型不存在|模型不支持/i.test(value)) {
    code = 'model'; message = '生图服务不支持当前模型，请检查模型名称及该模型是否支持生图。';
  } else if (status === 504 || /timeout|timed out|超时/i.test(value)) {
    code = 'timeout'; message = '等待生图服务超时，尚未收到图片；上游可能仍在处理，请查看网关任务状态。';
  } else if (/no[_ -]?(image|candidates)|image.*not.*(found|returned)|未返回图片|没有.*图片|无图片/i.test(value)) {
    code = 'no_image'; message = '生图网关没有收到可用图片。仅凭此错误无法确定是服务拒绝、模型返回异常还是临时故障，请查看网关日志。';
  } else if (stage === 'proxy' && /fetch failed|ECONN|ENOTFOUND|network/i.test(value)) {
    code = 'connection'; message = '项目服务器未能连接生图网关，请确认网关已启动，且地址能从项目服务器访问。';
  } else if (status === 400 || status === 422) {
    code = 'parameters'; message = '生图服务不接受本次请求参数，请检查模型支持的图片尺寸和返回格式。';
  }
  return { code, stage, status, message: `生图失败（HTTP ${status}）：${message}` };
}

export async function readImageErrorBody(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let text = '', bytes = 0;
  try {
    while (bytes < 32768) {
      const part = await reader.read();
      if (part.done) break;
      const accepted = part.value.subarray(0, 32768 - bytes);
      text += decoder.decode(accepted, { stream: true }); bytes += accepted.length;
    }
    return text + decoder.decode();
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

export async function imageResponseError(response: Response): Promise<Error> {
  let raw = '';
  try { raw = await readImageErrorBody(response); } catch { /* Keep HTTP status if the error body fails. */ }
  // The proxy only emits allowlisted classifications. Reconstruct local messages,
  // never display arbitrary upstream message strings or echoed request bodies.
  try {
    const data = JSON.parse(raw);
    const code = data.imageError?.code;
    const labels: Record<string, string> = {rejected:'content_filter',quota:'quota',rate_limit:'rate_limit',auth:'unauthorized',model:'model_not_found',timeout:'timeout',no_image:'no_image',connection:'fetch failed'};
    if (typeof code === 'string' && Object.hasOwn(labels, code)) {
      return new Error(imageFailure(response.status, labels[code], data.imageError.stage === 'proxy' ? 'proxy' : 'upstream').message);
    }
  } catch { /* Direct/legacy proxies can return plain text. */ }
  return new Error(imageFailure(response.status, raw).message);
}
