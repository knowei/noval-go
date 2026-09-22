/**
 * 清洗并严格作用域隔离剧本作者自定义 CSS
 * 1. 彻底剔除破坏全局布局与暗黑主题的全局规则（:root { color-scheme: light }、全局 * 通配重置、全局 input/textarea/button/select 重置）
 * 2. 将所有选择器精确前缀为 .${scopeClass}，确保自定义样式仅作用于故事对白正文与作者设定的容器内
 * 3. 额外使用现代 @scope 规则进行二次沙箱封装，确保绝对不污染顶部导航栏、底部操作输入栏、弹窗与抽屉
 */
export function scopeDeckCustomCss(
  rawCss: string | undefined | null,
  scopeClass: string = 'story-custom-scope'
): string {
  if (!rawCss || typeof rawCss !== 'string') return '';

  const scopeSelector = `.${scopeClass}`;

  // 1. 移除外部 @import 与注释
  let cleaned = rawCss
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import[^;]+;/gi, '');

  // 2. 彻底剔除破坏全站暗黑底色与输入体验的全局规则
  cleaned = cleaned
    // 剔除 :root 规则 (如强制全局亮色模式 color-scheme: light)
    .replace(/:root\s*\{[^}]*\}/gi, '')
    // 剔除全局 html / body 规则
    .replace(/(?:^|\})\s*(?:html|body)\s*\{[^}]*\}/gi, '')
    // 剔除全局通配符 * 重置
    .replace(/(?:^|\})\s*\*(\s*:[a-z-]+)?\s*\{[^}]*\}/gi, '')
    // 剔除输入框全局覆盖 textarea, input
    .replace(/(?:^|\})\s*(?:textarea|input(?:\[[^\]]*\])?)\s*:[a-z-]+\s*\{[^}]*\}/gi, '')
    .replace(/(?:^|\})\s*(?:textarea|input(?:\[[^\]]*\])?)\s*\{[^}]*\}/gi, '')
    // 剔除通用 button 和 Material-UI 全局按钮重写 (防止输入框和顶栏按钮被涂成刺眼青色/白色)
    .replace(/(?:^|\})\s*(?:button|\.MuiButton[^{]*)\s*\{[^}]*\}/gi, '')
    // 剔除企图直接针对系统控制面板与界面的破坏性规则
    .replace(/(?:^|\})\s*[^}]*?(?:\.reality-panel|\.reality-summary|\.reality-body|\.reality-arrow|\.system-details|\.system-summary|#theater-header|#chat-input|\.card-turn-action-bar)[^{]*\{[^}]*\}/gi, '')
    // 剔除全局移动端破坏性重置
    .replace(/(?:input|textarea|select|button|pre|code)[^{]*\{[^}]*\}/gi, '');

  // 3. 严格隔离系统折叠面板（思维链、记忆沉淀、行动抉择等系统 UI 组件）
  // 严禁作者裸 details/summary 污染系统面板：自动追加 :not(.reality-panel):not(.system-details)
  cleaned = cleaned
    .replace(/(?<![-\w\.#])details(?![-\w]|:not\()/gi, 'details:not(.reality-panel):not(.system-details)')
    .replace(/(?<![-\w\.#])summary(?![-\w]|:not\()/gi, 'summary:not(.reality-summary):not(.system-summary)');

  // 4. 将所有选择器加上 scopeSelector 前缀
  function prefixSelectors(cssText: string): string {
    return cssText.replace(/([^{}]+)\{([^{}]+)\}/g, (match, selectors, declarations) => {
      const trimmed = selectors.trim();
      if (!trimmed || trimmed.startsWith('@')) return match;

      const prefixed = trimmed
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((s: string) => {
          if (s === 'body' || s === 'html' || s === ':root') return scopeSelector;
          if (s.startsWith(scopeSelector)) return s;
          return `${scopeSelector} ${s}`;
        })
        .join(',\n');

      return `${prefixed} {\n${declarations}\n}\n`;
    });
  }

  // 处理 @media 规则内部的选择器前缀
  const mediaRegex = /@media[^{]+\{([\s\S]+?\})\s*\}/g;
  let result = cleaned.replace(mediaRegex, (mediaMatch) => {
    const braceIdx = mediaMatch.indexOf('{');
    const mediaHeader = mediaMatch.substring(0, braceIdx + 1);
    const innerContent = mediaMatch.substring(braceIdx + 1, mediaMatch.lastIndexOf('}'));
    const prefixedInner = prefixSelectors(innerContent);
    return `${mediaHeader}\n${prefixedInner}\n}`;
  });

  result = prefixSelectors(result).trim();

  return `
/* === Scoped Deck Custom Theme for ${scopeSelector} === */
${result}

@scope (${scopeSelector}) {
  ${cleaned}
}
`;
}
