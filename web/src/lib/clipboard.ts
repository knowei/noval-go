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

  // 1) 安全上下文（HTTPS / localhost）下的原生路径
  try {
    const clip = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (clip && typeof clip.writeText === 'function') {
      clip.writeText(text).catch(() => {});
      ok = true;
    }
  } catch {
    // 忽略：继续走兜底
  }

  // 2) 同步 execCommand：非安全上下文下唯一可行的路径
  try {
    if (typeof document === 'undefined' || !document.body) return ok;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.contentEditable = 'true';
    ta.readOnly = false;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.width = '1px';
    ta.style.height = '1px';
    ta.style.padding = '0';
    ta.style.border = 'none';
    ta.style.outline = 'none';
    ta.style.boxShadow = 'none';
    ta.style.background = 'transparent';
    ta.style.color = 'transparent';
    ta.style.opacity = '0.01';
    ta.style.zIndex = '2147483647';
    document.body.appendChild(ta);
    try {
      const range = document.createRange();
      range.selectNodeContents(ta);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      // 选区设置失败时仍尝试 setSelectionRange
    }
    ta.focus();
    ta.setSelectionRange(0, text.length);
    if (document.execCommand && document.execCommand('copy')) ok = true;
    document.body.removeChild(ta);
  } catch {
    // 保持 ok 现状
  }

  return ok;
}
