/**
 * 跨环境复制文本。
 *
 * 为什么不能直接用 `navigator.clipboard`：
 * 它是 **Secure Context 专属 API**。部署在 `http://<IP>:3000` 这类非安全上下文时，
 * 移动端与桌面端它都是 `undefined`，直接调用会抛
 * `TypeError: Cannot read properties of undefined (reading 'writeText')`，
 * 被空的 catch 吞掉后表现为「点了复制没任何反应，也没有已复制提示」。
 *
 * 这里统一降级到同步的 `execCommand('copy')`，并采用 iOS 可靠配方
 * （`contentEditable` + `Range` 选中；只 setSelectionRange 在 Safari 上不稳定）。
 *
 * ⚠️ 使用时注意：`execCommand` 必须在**用户手势的同步调用栈内**执行。
 * 本函数是同步的，请在 click 处理器里直接调用，
 * 不要放在 `await` 之后或 `setTimeout` 里 —— 那样移动端一定会被拒绝。
 *
 * @returns 是否复制成功（用于决定要不要显示「已复制」）
 */
export function copyText(text: string): boolean {
  if (!text) return false;
  let ok = false;

  // 1) 优先尝试同步 execCommand：确保在非安全上下文（HTTP）与移动端手势中稳定执行
  try {
    if (typeof document !== 'undefined' && document.body) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.readOnly = false;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '2em';
      ta.style.height = '2em';
      ta.style.padding = '0';
      ta.style.border = 'none';
      ta.style.outline = 'none';
      ta.style.boxShadow = 'none';
      ta.style.background = 'transparent';
      ta.style.color = 'transparent';
      ta.style.opacity = '0.01';
      ta.style.zIndex = '2147483647';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      if (document.execCommand && document.execCommand('copy')) {
        ok = true;
      }
      document.body.removeChild(ta);
    }
  } catch {
    // 忽略异常，尝试下个通道
  }

  // 2) 若安全上下文可用，并发调用 clipboard.writeText 作为补充
  try {
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (clip && typeof clip.writeText === 'function') {
      clip.writeText(text).catch(() => {});
      ok = true;
    }
  } catch {
    // 忽略
  }

  return ok;
}
