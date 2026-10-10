/**
 * 分支行动与玩家输入文本规整工具库
 * 杜绝「【长句子】：长句子」重复拼装以及「【【双重括号】】」等格式瑕疵
 */

export interface BranchOptionLike {
  title?: string;
  desc?: string;
  tag?: string;
}

/**
 * 格式化分支选项为干净、自然的玩家行动文本
 */
export function formatBranchAction(b: BranchOptionLike): string {
  const rawTitle = (b.title || '').trim();
  const rawDesc = (b.desc || '').trim();

  // 清洗外层包裹的方头括号与英文中括号
  const cleanTitle = rawTitle.replace(/^[【\[]+|[】\]]+$/g, '').trim();
  const cleanDesc = rawDesc.replace(/^[【\[]+|[】\]]+$/g, '').trim();

  // 1. 如果没有 desc，或 desc 与 title 完全相同，或 cleanTitle 已经包含了完整的 cleanDesc
  if (!cleanDesc || cleanDesc === cleanTitle || cleanTitle.includes(cleanDesc)) {
    return cleanTitle || rawTitle;
  }

  // 2. 如果 cleanDesc 包含了 cleanTitle（例如 title 是短标题，desc 是具体展开）
  if (cleanDesc.includes(cleanTitle)) {
    if (cleanTitle.length <= 8) {
      return `【${cleanTitle}】：${cleanDesc}`;
    }
    return cleanDesc;
  }

  // 3. title 与 desc 不同，且 title 是简短的策略/情绪标签（如：【果断反击】、【温柔安抚】）
  if (cleanTitle.length <= 10) {
    return `【${cleanTitle}】：${cleanDesc}`;
  }

  // 4. 两者都是长句，避免重复啰嗦，优先采用更为详尽的 desc
  return cleanDesc || cleanTitle;
}

/**
 * 归一化任意发送文本，自动剥离意外产生的「【重复句子】：重复句子」或双重括号
 */
export function normalizeActionText(text: string): string {
  if (!text) return '';
  let trimmed = text.trim();

  // 修复类似 【【xxx】】：xxx 或 【xxx】：xxx
  const repeatMatch = trimmed.match(/^(?:【+|\[+)([^】\]]+)(?:】+|\]+)\s*[：:]\s*(.+)$/);
  if (repeatMatch) {
    const left = repeatMatch[1].replace(/^[【\[]+|[】\]]+$/g, '').trim();
    const right = repeatMatch[2].replace(/^[【\[]+|[】\]]+$/g, '').trim();
    if (left === right || left.includes(right) || right.includes(left)) {
      // 左右两段高度重复或相同，直接保留更详尽或去重后的一段，并清除残留外框
      const chosen = right.length >= left.length ? right : left;
      return chosen.replace(/^[【\[]+|[】\]]+$/g, '').trim();
    }
    // 如果左侧是超长句子（>12字），说明是把整句当成了标题加冒号重复，直接返回内容
    if (left.length > 12) {
      const chosen = right.length >= left.length ? right : left;
      return chosen.replace(/^[【\[]+|[】\]]+$/g, '').trim();
    }
    return `【${left}】：${right}`;
  }

  // 清理多余的双重括号 【【xxx】】 -> 【xxx】
  trimmed = trimmed.replace(/【{2,}/g, '【').replace(/】{2,}/g, '】');
  return trimmed;
}
