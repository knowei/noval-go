/**
 * CG立绘资源调度中心 (CG & Tachie Resource Manager)
 * 1. 管理与解析剧本内嵌的 CSS 原画映射表 (459+ 张原画立绘与CG动态切片)
 * 2. 支持在故事正文、名场面及状态面板中检索并呈现高清立绘插图
 */

const deckCgStore: Record<string, Record<string, string>> = {};

/**
 * 从 CSS 文本提取 class -> image URL 映射
 */
export function extractCgMapFromCss(cssText: string): Record<string, string> {
  if (!cssText) return {};
  const rules = cssText.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{[^}]*background(?:-image)?:\s*url\(([^)]+)\)/g);
  const map: Record<string, string> = {};
  for (const match of rules) {
    const cls = match[1];
    const url = match[2].trim().replace(/^['"]|['"]$/g, '');
    if (url.startsWith('http')) {
      map[cls] = url;
    }
  }
  return map;
}

/**
 * 注册剧本的 CG 映射表
 */
export function registerDeckCgMap(deckId: string, map: Record<string, string>) {
  if (!deckId || !map) return;
  deckCgStore[deckId] = { ...(deckCgStore[deckId] || {}), ...map };
}

/**
 * 获取当前剧本的 CG 映射表
 */
export function getDeckCgMap(deckId?: string): Record<string, string> {
  if (deckId && deckCgStore[deckId]) {
    return deckCgStore[deckId];
  }
  // 如果没有指定 deckId 或未找到，寻找包含 img-FZ 的任何映射表
  for (const id in deckCgStore) {
    if (id.includes('7a68d42a') || id.includes('sister_debt') || Object.keys(deckCgStore[id]).some(k => k.startsWith('img-FZ'))) {
      return deckCgStore[id];
    }
  }
  return {};
}

/**
 * 根据立绘标签/代码解析出真实高清图片 URL
 * 兼容格式：
 * - img-FZ-01, FZ-01, img-BQ-02, img-N-01, img-XA-01
 */
export function resolveCgUrl(rawKey: string, deckId?: string): string | null {
  if (!rawKey) return null;
  const cleanKey = rawKey.trim();

  const map = getDeckCgMap(deckId);

  // 1. 直接精确匹配
  if (map[cleanKey]) return map[cleanKey];

  // 2. 补全 img- 前缀
  if (!cleanKey.startsWith('img-')) {
    const prefixed = `img-${cleanKey}`;
    if (map[prefixed]) return map[prefixed];
  }

  // 3. 从带有描述的文本中提取 (例如 "居家单薄旧睡裙 (img-FZ-01)")
  const extracted = cleanKey.match(/img-[A-Za-z0-9_-]+/i) || cleanKey.match(/(?:FZ|BQ|XA|N|BG|ZP|ZS)-\d+/i);
  if (extracted) {
    let k = extracted[0];
    if (!k.startsWith('img-')) k = `img-${k}`;
    if (map[k]) return map[k];
  }

  // 4. 若为《巨乳妹妹还债生活》内置的常见典型立绘保底库
  const sisterFallbackMap: Record<string, string> = {
    'img-FZ-01': 'https://miha.wiki/bvqXru.png', // 居家旧睡裙
    'img-FZ-02': 'https://miha.wiki/drxnzq.png',
    'img-FZ-03': 'https://miha.wiki/PGRmLE.png', // 心动女仆装
    'img-FZ-04': 'https://miha.wiki/egAgDs.png',
    'img-FZ-05': 'https://miha.wiki/eQ1W4R.png', // 水手服
    'img-FZ-08': 'https://miha.wiki/P54YvR.png', // 兔女郎
    'img-BQ-01': 'https://miha.wiki/3jmZg1.png', // 害羞/娇嗔
    'img-BQ-02': 'https://miha.wiki/k09uvl.png',
    'img-BQ-03': 'https://miha.wiki/ejcEAh.png',
    'img-N-01': 'https://miha.wiki/aEj6B5.png',  // 名场面插画
    'img-N-02': 'https://miha.wiki/Uae6yU.png',
    'img-N-03': 'https://i.ibb.co/gZKPVMCC/00279-576565423.png',
    'img-ZS-01': 'https://miha.wiki/xNES23.gif'
  };

  const normalizedCode = cleanKey.startsWith('img-') ? cleanKey : `img-${cleanKey}`;
  if (normalizedCode in sisterFallbackMap) return sisterFallbackMap[normalizedCode];

  const codeMatch = cleanKey.match(/img-[A-Za-z0-9_-]+/i) || cleanKey.match(/(?:FZ|BQ|XA|N|BG|ZP|ZS)-\d+/i);
  if (codeMatch) {
    const norm = codeMatch[0].startsWith('img-') ? codeMatch[0] : `img-${codeMatch[0]}`;
    if (norm in sisterFallbackMap) return sisterFallbackMap[norm];
  }

  return null;
}

export interface DetectedCgItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

/**
 * 从一段剧情正文或名场面中提取所有命中的 CG / 立绘
 */
export function extractCgItemsFromStory(text: string, deckId?: string): DetectedCgItem[] {
  if (!text) return [];
  const results: DetectedCgItem[] = [];
  const seenIds = new Set<string>();

  // 1. 匹配显式 <cg id="..." title="..." /> 或 <cg>img-xxx</cg>
  const cgTagRegex = /<cg\s+id=["']([^"']+)["'](?:\s+title=["']([^"']*)["'])?\s*\/?>|<cg>([^<]+)<\/cg>/gi;
  let match;
  while ((match = cgTagRegex.exec(text)) !== null) {
    const id = (match[1] || match[3] || '').trim();
    const title = match[2] || getCgDefaultTitle(id);
    const url = resolveCgUrl(id, deckId);
    if (url && !seenIds.has(id)) {
      seenIds.add(id);
      results.push({ id, url, title, category: getCgCategory(id) });
    }
  }

  // 2. 匹配 HTML 类名格式：<div class="... (img-[A-Za-z0-9_-]+) ...">
  const classRegex = /class=["'][^"']*\b(img-[A-Za-z0-9_-]+)\b[^"']*["']/gi;
  while ((match = classRegex.exec(text)) !== null) {
    const id = match[1].trim();
    const url = resolveCgUrl(id, deckId);
    if (url && !seenIds.has(id)) {
      seenIds.add(id);
      results.push({ id, url, title: getCgDefaultTitle(id), category: getCgCategory(id) });
    }
  }

  // 3. 匹配正文显式提及的独立代码 [CG: img-xxx] 或 (img-xxx)
  const codeRegex = /\[(?:CG|立绘|插画):\s*(img-[A-Za-z0-9_-]+)\]|\b(img-[A-Za-z0-9_-]+)\b/gi;
  while ((match = codeRegex.exec(text)) !== null) {
    const id = (match[1] || match[2] || '').trim();
    const url = resolveCgUrl(id, deckId);
    if (url && !seenIds.has(id)) {
      seenIds.add(id);
      results.push({ id, url, title: getCgDefaultTitle(id), category: getCgCategory(id) });
    }
  }

  return results;
}

export function getCgCategory(id: string): string {
  if (id.includes('-FZ-')) return '立绘服装';
  if (id.includes('-BQ-')) return '神态微表情';
  if (id.includes('-N-')) return '剧情CG插画';
  if (id.includes('-XA-')) return '互动动作';
  if (id.includes('-BG-')) return '场景背景';
  if (id.includes('-ZP-')) return '留念相片';
  if (id.includes('-ZS-')) return '动态演播';
  return 'CG立绘';
}

export function getCgDefaultTitle(id: string): string {
  const cat = getCgCategory(id);
  const num = id.replace(/^[a-zA-Z]+-[a-zA-Z]+-?/, '');
  return `${cat} · ${id}`;
}
