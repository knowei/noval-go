import type { ConversationSave } from './types';
export const branchInfo = (save: ConversationSave) => save.branch_info || save.history?.[0]?.branchInfo;

export function branchTree(saves: ConversationSave[]) {
  const byId = new Map(saves.map(s=>[s.id,s]));
  const seen = new Set<string>();
  const result: { save: ConversationSave; depth: number; root: string }[] = [];
  const sorted = [...saves].sort((a,b)=>(branchInfo(b)?.createdAt || b.created_at || '').localeCompare(branchInfo(a)?.createdAt || a.created_at || ''));
  const visit = (save: ConversationSave, depth: number) => {
    if (seen.has(save.id)) return;
    seen.add(save.id); const info=branchInfo(save);
    result.push({save,depth:Math.min(depth,8),root:info?.rootId || info?.sourceId || '旧存档'});
    sorted.filter(s=>branchInfo(s)?.parentId===save.id).forEach(s=>visit(s,depth+1));
  };
  sorted.filter(s=>!byId.has(branchInfo(s)?.parentId || '')).forEach(s=>visit(s,0));
  sorted.forEach(s=>visit(s,0)); // Malformed imported cycles remain visible once.
  return result;
}
