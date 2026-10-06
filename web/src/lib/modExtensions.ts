import type { EnabledMods } from './types';
import type { SessionExtension } from './sessionEngine';

/**
 * 模组中心开关 → 声明式扩展 的桥接层。
 *
 * 背景：模组中心的 9 个开关此前只写入 localStorage / 影响界面显示，
 * `buildSessionPrompt` 完全读不到 `enabledMods`，因此打开任何开关都不会
 * 改变发给模型的内容（实测：9 个开关对提示词零影响）。
 *
 * 这里把开关翻译成声明式扩展的 `afterHistory` 钩子——该位置排在全部历史之后、
 * 离模型最近（等价于酒馆的 Post-History Instructions）。整个过程是纯函数，
 * 不写入存档、不迁移旧数据，关掉开关即立刻失效。
 */
export function modExtensions(mods?: Partial<EnabledMods> | null): SessionExtension[] {
  if (!mods) return [];
  const out: SessionExtension[] = [];
  const add = (id: string, name: string, afterHistory: string) => {
    out.push({ apiVersion: 1, id, name, version: '1.0.0', enabled: true, hooks: { afterHistory } });
  };

  // 1) 反强推 / 推演风格
  if (mods.antiCoercion === false) {
    add('mod_compliance', '模组·无拘顺从', '角色在被逼近时表现为羞耻、动摇与生理反应，但最终深层配合，不出现逃跑、呼救、报警或找人评理的桥段；既有亲密默契可视为许可。');
  } else {
    add('mod_realism', '模组·真实推拉', '角色有独立的自尊与底线：在当期未给出许可的情况下遭遇强迫，必须出现真实的自卫反应（拒绝、挣脱、呼救），不因玩家坚持就转为顺从。');
  }

  // 2) 心声潜台词
  if (mods.innerVoice !== false) {
    add('mod_inner_voice', '模组·心声潜台词', '角色的言不由衷之处，用 <thk>……</thk> 写出其真实心声或身体反应，与嘴上说的话形成反差。');
  }

  // 3) 行动分支
  if (mods.explorationBranches !== false) {
    add('mod_branches', '模组·行动分支', '文末的可选行动要紧扣本轮刚发生的事，彼此风格有明显差异，不要与最近几轮出现过的行动重复。');
  }

  // 4) 恋爱心防阶梯（同时恢复 HUD 数据来源）
  if (mods.affectionGauge) {
    add('mod_affection', '模组·恋爱心防阶梯', '在全部附加数据之后，单独输出一行 <love_status>[目标角色] | [心动值]/100 ([阶段]) | [心防]% | [当前许可]</love_status>；心动值单轮增减不超过 3 点，不得跨阶突变。');
  }

  // 5) TRPG 状态
  if (mods.rpgAdventureHud) {
    add('mod_rpg', '模组·TRPG状态机', '在全部附加数据之后，单独输出一行 <rpg_status>[境界/等级] (进度/100) | [生命]% | [法力]% | [背包] | [本轮收获]</rpg_status>；资源严格守恒，未达突破条件不得自行进阶。');
  }

  // 6) 世界书因果锚定
  if (mods.lorebookArbiter !== false) {
    add('mod_lore_arbiter', '模组·世界书法则', '本轮激活的世界书条目是不可违背的设定法则；与法则相悖的玩家声明应被当场证伪，不要顺着改写既有设定。');
  }

  // 7) 阶段推拉锁
  if (mods.phaseLock) {
    add('mod_phase', '模组·阶段推拉', '在全部附加数据之后，单独输出一行 <scene_phase>[阶段名] (进度/100) | [核心任务] | [解锁条件]</scene_phase>；未达成当前阶段目标前，角色的防线不应全面失守。');
  }

  // 8) 环境突发危机
  if (mods.sceneIncidents !== false) {
    add('mod_incidents', '模组·环境突发', '每隔 2~3 轮在正文中主动制造一次外部打扰或意外（用 <alert>……</alert> 标出），打破平淡节奏。');
  }

  // 9) 末世生存规则
  if (mods.apocalypseSurvival) {
    add('mod_survival', '模组·废土生存', '生存资源严格守恒：奔跑、破门、格斗、搜刮都要消耗体力与饮水；搜刮结果由场景客观决定，玩家不能凭空获得高价值物资。');
  }

  return out;
}

/** 把模组扩展并入会话设置；同 id 的已有扩展以用户配置为准，避免覆盖。 */
export function applyModExtensions<T extends { extensions: SessionExtension[] }>(settings: T, mods?: Partial<EnabledMods> | null): T {
  const injected = modExtensions(mods);
  if (!injected.length) return settings;
  const existing = new Set((settings.extensions || []).map((e) => e.id));
  const merged = injected.filter((e) => !existing.has(e.id));
  if (!merged.length) return settings;
  return { ...settings, extensions: [...(settings.extensions || []), ...merged] };
}
