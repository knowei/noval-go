import { create } from 'zustand';
import { UserProfile, StoryDeck, Turn, ConversationSave, ModelSettings, EnabledMods } from './types';
import { fetchConversations, fetchConversation, saveConversation, deleteConversation } from './api';
import { normalizeSession, SessionSettings } from './sessionEngine';
import { safeRandomUUID } from './uuid';

// Serialize writes so an older streaming save cannot overwrite a completed reply.
let saveQueue: Promise<void> = Promise.resolve();

export const isCheckpointId = (id: string) => id.startsWith('branch_');

const defaultMods: EnabledMods = {
  apocalypseSurvival: false,
  antiCoercion: true,
  innerVoice: true,
  explorationBranches: true,
  affectionGauge: false,
  rpgAdventureHud: false,
  lorebookArbiter: true,
  phaseLock: false,
  sceneIncidents: false,
  haremIntimacyRecord: false,
};

const getInitialMods = (): EnabledMods => {
  if (typeof window === 'undefined') return defaultMods;
  try {
    const raw = localStorage.getItem('rp_enabled_mods');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apocalypseSurvival: parsed.apocalypseSurvival ?? false,
        antiCoercion: parsed.antiCoercion ?? true,
        innerVoice: parsed.innerVoice ?? true,
        explorationBranches: parsed.explorationBranches ?? true,
        affectionGauge: parsed.affectionGauge ?? false,
        rpgAdventureHud: parsed.rpgAdventureHud ?? false,
        lorebookArbiter: parsed.lorebookArbiter ?? true,
        phaseLock: parsed.phaseLock ?? false,
        sceneIncidents: parsed.sceneIncidents ?? false,
        haremIntimacyRecord: parsed.haremIntimacyRecord ?? false,
      };
    }
  } catch (e) {
    // fallback
  }
  return defaultMods;
};

const getOrCreateUserId = (): string => {
  if (typeof window === 'undefined') return 'guest_default';
  try {
    let uid = localStorage.getItem('rp_current_user_id') || localStorage.getItem('noval_user_id');
    if (!uid || uid === 'default_user') {
      uid = 'guest_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('rp_current_user_id', uid);
      localStorage.setItem('noval_user_id', uid);
    }
    return uid;
  } catch {
    return 'guest_default';
  }
};

interface AppState {
  sessionSettings: SessionSettings;
  setSessionSettings: (settings: Partial<SessionSettings>) => void;
  saveError: string | null;
  isBranching: boolean;
  currentLineage: Turn['lineage'];
  updateCheckpoint: (id: string, update: { name?: string; trashed?: boolean }) => Promise<boolean>;
  replaceHistoryWithCheckpoint: (history: Turn[], reason: string) => Promise<boolean>;
  restoreCheckpoint: (id: string) => Promise<boolean>;
  currentUserId: string;
  currentUser: UserProfile | null;
  authToken: string | null;
  currentDeckKey: string;
  currentDeck: StoryDeck | null;
  currentConversationId: string;
  conversationHistory: Turn[];
  savedConversations: ConversationSave[];
  modelSettings: ModelSettings;
  isSettingsOpen: boolean;
  isUserSwitchOpen: boolean;
  isDrawerOpen: boolean;
  isModCenterOpen: boolean;
  enabledMods: EnabledMods;
  isSiteUnlocked: boolean;
  setIsSiteUnlocked: (unlocked: boolean) => void;

  setCurrentUserId: (id: string) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  setCurrentDeck: (deckKey: string, deck: StoryDeck | null) => void;
  setConversationHistory: (history: Turn[]) => void;
  setCurrentConversationId: (id: string) => void;
  addTurn: (turn: Turn) => void;
  updateTurn: (index: number, turn: Partial<Turn>) => void;
  truncateHistory: (fromIndex: number) => Promise<boolean>;
  setSavedConversations: (saves: ConversationSave[]) => void;
  setModelSettings: (settings: Partial<ModelSettings>) => void;
  toggleRoleplayMode: () => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsUserSwitchOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setIsModCenterOpen: (open: boolean) => void;
  toggleMod: (modKey: keyof EnabledMods) => void;
  setEnabledMods: (mods: Partial<EnabledMods>) => void;
  refreshSaves: () => Promise<void>;
  startNewStory: (deck: StoryDeck) => void;
  autoSave: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  sessionSettings: normalizeSession(),
  saveError: null,
  isBranching: false,
  currentLineage: undefined,
  updateCheckpoint: (id, update) => editCheckpoint(id, update),
  replaceHistoryWithCheckpoint: (history, reason) => changeBranch(async () => history, reason),
  restoreCheckpoint: (id) => changeBranch(async () => {
    const { currentUserId, currentDeckKey } = get();
    if (!isCheckpointId(id)) throw new Error('请选择剧情分支。');
    const saved = await fetchConversation(id);
    if (!saved || saved.user_id !== currentUserId || saved.deck_id !== currentDeckKey || !saved.history?.length) {
      throw new Error('无法读取此分支，请刷新列表后重试。');
    }
    return saved.history;
  }, '恢复分支前', id),
  setSessionSettings: (settings) => {
    set(state => {
      const next = normalizeSession({ ...state.sessionSettings, ...settings });
      const history = [...state.conversationHistory];
      if (history[0]) history[0] = { ...history[0], session: next };
      return { sessionSettings: next, conversationHistory: history };
    });
    void get().autoSave();
  },
  currentUserId: getOrCreateUserId(),
  currentUser: null,
  authToken: typeof window !== 'undefined' ? localStorage.getItem('rp_auth_token') : null,
  currentDeckKey: 'deck_coser_sister',
  currentDeck: null,
  currentConversationId: '',
  conversationHistory: [],
  savedConversations: [],
  modelSettings: {
    model: typeof window !== 'undefined' ? localStorage.getItem('rp_api_model') || 'deepseek-flash' : 'deepseek-flash',
    baseUrl: typeof window !== 'undefined' ? localStorage.getItem('rp_api_base_url') || 'https://api.openai.com/v1' : 'https://api.openai.com/v1',
    apiKey: typeof window !== 'undefined' ? localStorage.getItem('rp_api_key') || '' : '',
    temperature: 0.7,
    topP: 0.95,
    roleplayMode: typeof window !== 'undefined' ? (localStorage.getItem('rp_roleplay_mode') as any) || 'realistic' : 'realistic',
  },
  isSettingsOpen: false,
  isUserSwitchOpen: false,
  isDrawerOpen: false,
  isModCenterOpen: false,
  enabledMods: getInitialMods(),
  isSiteUnlocked: (() => {
    if (typeof window === 'undefined') return false;
    try {
      return !!localStorage.getItem('noval_site_access_token');
    } catch {
      return false;
    }
  })(),
  setIsSiteUnlocked: (unlocked: boolean) => {
    if (typeof window !== 'undefined') {
      if (!unlocked) {
        try {
          localStorage.removeItem('noval_site_access_token');
          document.cookie = 'site_access_token=; path=/; max-age=0; SameSite=Lax';
        } catch {}
      }
    }
    set({ isSiteUnlocked: unlocked });
  },

  setCurrentUserId: (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rp_current_user_id', id);
      localStorage.setItem('noval_user_id', id);
    }
    set({ currentUserId: id });
    get().refreshSaves();
  },

  login: (user: UserProfile, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rp_auth_token', token);
      localStorage.setItem('rp_current_user_id', user.id);
      localStorage.setItem('noval_user_id', user.id);
    }
    set({
      currentUserId: user.id,
      currentUser: user,
      authToken: token,
      conversationHistory: [],
      currentConversationId: '',
    });
    if ((user as any).model_config) {
      const cfg = (user as any).model_config;
      if (cfg.api_key || cfg.api_base || cfg.api_model) {
        get().setModelSettings({
          model: cfg.api_model || get().modelSettings.model,
          baseUrl: cfg.api_base || get().modelSettings.baseUrl,
          apiKey: cfg.api_key || get().modelSettings.apiKey,
        });
      }
    }
    get().refreshSaves();
  },

  logout: () => {
    const newGuestId = 'guest_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rp_auth_token');
      localStorage.setItem('rp_current_user_id', newGuestId);
      localStorage.setItem('noval_user_id', newGuestId);
    }
    set({
      currentUserId: newGuestId,
      currentUser: {
        id: newGuestId,
        username: 'guest',
        nickname: '设备访客',
        avatar: '🎭',
        role: 'guest',
        is_guest: true
      },
      authToken: null,
      conversationHistory: [],
      currentConversationId: '',
      savedConversations: []
    });
    get().refreshSaves();
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user && (user as any).model_config) {
      const cfg = (user as any).model_config;
      if (cfg.api_key || cfg.api_base || cfg.api_model) {
        get().setModelSettings({
          model: cfg.api_model || get().modelSettings.model,
          baseUrl: cfg.api_base || get().modelSettings.baseUrl,
          apiKey: cfg.api_key || get().modelSettings.apiKey,
        });
      }
    }
  },
  setCurrentDeck: (deckKey, deck) => set({ currentDeckKey: deckKey, currentDeck: deck }),
  setConversationHistory: (history) => set({
    currentLineage: history?.[0]?.lineage || get().currentLineage,
    sessionSettings: normalizeSession(history?.[0]?.session || get().sessionSettings),
    conversationHistory: Array.isArray(history)
      ? history.filter((t): t is Turn => Boolean(t && typeof t === 'object'))
      : []
  }),
  setCurrentConversationId: (id) => set({ currentConversationId: id, currentLineage: { rootId: id }, sessionSettings: normalizeSession(get().currentDeck?.sessionDefaults), saveError: null }),
  
  addTurn: (turn) => {
    if (!turn) return;
    set((state) => ({ conversationHistory: [...state.conversationHistory.filter(Boolean), state.conversationHistory.length ? turn : { ...turn, session: state.sessionSettings, lineage: state.currentLineage }] }));
    if (turn.incomplete) return;
    get().autoSave();
  },

  updateTurn: (index, turn) => {
    set((state) => {
      const next = [...state.conversationHistory];
      if (index >= 0 && index < next.length && next[index]) {
        next[index] = { ...next[index], ...turn };
      } else if (index >= 0) {
        next[index] = turn as Turn;
      }
      return { conversationHistory: next.filter((t): t is Turn => Boolean(t && typeof t === 'object')) };
    });
    if (!turn.incomplete) get().autoSave();
  },

  truncateHistory: (fromIndex) => get().replaceHistoryWithCheckpoint(get().conversationHistory.slice(0, fromIndex), '回退前'),

  setSavedConversations: (saves) => set({ savedConversations: saves }),
  
  setModelSettings: (settings) => {
    set((state) => {
      const updated = { ...state.modelSettings, ...settings };
      if (typeof window !== 'undefined') {
        if (updated.model) localStorage.setItem('rp_api_model', updated.model);
        if (updated.baseUrl) localStorage.setItem('rp_api_base_url', updated.baseUrl);
        if (updated.apiKey !== undefined) localStorage.setItem('rp_api_key', updated.apiKey);
        if (updated.roleplayMode) localStorage.setItem('rp_roleplay_mode', updated.roleplayMode);
      }
      return { modelSettings: updated };
    });
  },

  toggleRoleplayMode: () => {
    const current = get().modelSettings.roleplayMode || 'realistic';
    const next = current === 'realistic' ? 'unrestricted' : 'realistic';
    get().setModelSettings({ roleplayMode: next });
    get().setEnabledMods({ antiCoercion: next === 'realistic' });
  },

  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setIsUserSwitchOpen: (open) => set({ isUserSwitchOpen: open }),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setIsModCenterOpen: (open) => set({ isModCenterOpen: open }),

  toggleMod: (modKey) => {
    set((state) => {
      const nextVal = !state.enabledMods[modKey];
      const nextMods = { ...state.enabledMods, [modKey]: nextVal };
      if (typeof window !== 'undefined') {
        localStorage.setItem('rp_enabled_mods', JSON.stringify(nextMods));
      }
      if (modKey === 'antiCoercion') {
        const nextRp = nextVal ? 'realistic' : 'unrestricted';
        if (typeof window !== 'undefined') {
          localStorage.setItem('rp_roleplay_mode', nextRp);
        }
        return {
          enabledMods: nextMods,
          modelSettings: { ...state.modelSettings, roleplayMode: nextRp }
        };
      }
      return { enabledMods: nextMods };
    });
  },

  setEnabledMods: (mods) => {
    set((state) => {
      const nextMods = { ...state.enabledMods, ...mods };
      if (typeof window !== 'undefined') {
        localStorage.setItem('rp_enabled_mods', JSON.stringify(nextMods));
      }
      return { enabledMods: nextMods };
    });
  },

  refreshSaves: async () => {
    const { currentUserId } = get();
    const saves = await fetchConversations(currentUserId);
    if (get().currentUserId === currentUserId) set({ savedConversations: saves });
  },

  startNewStory: (deck: StoryDeck) => {
    const newId = 'conv_' + Date.now();
    set({
      currentDeckKey: deck.id,
      currentDeck: deck,
      currentConversationId: newId,
      currentLineage: { rootId: newId },
      sessionSettings: normalizeSession(deck.sessionDefaults),
      saveError: null,
      conversationHistory: []
    });
  },

  autoSave: async () => {
    const { currentConversationId, currentUserId, currentDeckKey, currentDeck, conversationHistory } = get();
    const cleanHistory = (conversationHistory || []).filter((t): t is Turn => Boolean(t && typeof t === 'object'));
    if (cleanHistory[0]) cleanHistory[0] = { ...cleanHistory[0], session: get().sessionSettings, lineage: get().currentLineage };
    if (!currentConversationId) return;

    if (cleanHistory.length === 0) {
      saveQueue = saveQueue.catch(() => {}).then(async () => {
        if (get().currentUserId !== currentUserId) return;
        const ok = await deleteConversation(currentConversationId);
        if (get().currentConversationId === currentConversationId) set({ saveError: ok ? null : '存档删除失败，请重试。' });
        await get().refreshSaves();
      });
      await saveQueue;
      return;
    }

    const lastTurn = cleanHistory[cleanHistory.length - 1];
    const payload = {
      id: currentConversationId,
      user_id: currentUserId,
      deck_id: currentDeckKey,
      deck_title: currentDeck?.title || '中式人生',
      title: lastTurn?.location || `${currentDeck?.title || '剧本'} · 第 ${cleanHistory.length} 幕`,
      history: cleanHistory
    };

    saveQueue = saveQueue.catch(() => {}).then(async () => {
      if (get().currentUserId !== currentUserId) return;
      const ok = await saveConversation(payload);
      if (get().currentConversationId === currentConversationId) set({ saveError: ok ? null : '自动保存失败，请重试或导出会话备份。' });
      await get().refreshSaves();
    });
    await saveQueue;
  }
}));

// Checkpoints are independent saves. Never mutate the active timeline until its
// previous contents are durable, and never apply a delayed result to another chat.
async function changeBranch(loadHistory: () => Promise<Turn[]>, reason: string, restoredId?: string): Promise<boolean> {
  const initial = useAppStore.getState();
  if (initial.isBranching || !initial.currentConversationId || isCheckpointId(initial.currentConversationId)) return false;
  const isCurrent = () => {
    const now = useAppStore.getState();
    return now.currentUserId === initial.currentUserId && now.currentConversationId === initial.currentConversationId
      && now.currentDeckKey === initial.currentDeckKey && now.conversationHistory === initial.conversationHistory
      && now.sessionSettings === initial.sessionSettings;
  };
  useAppStore.setState({ isBranching: true, saveError: null });
  try {
    const next = await loadHistory();
    if (!isCurrent()) return false;
    const oldHistory = initial.conversationHistory;
    const archiveId = 'branch_' + safeRandomUUID();
    let saved = !oldHistory.length;
    if (oldHistory.length) {
      const createdAt = new Date().toISOString();
      const payload = {
        id: archiveId, user_id: initial.currentUserId,
        deck_id: initial.currentDeckKey, deck_title: initial.currentDeck?.title || '剧本',
        title: `${reason} · ${oldHistory.length} 条消息`,
        history: oldHistory.map((turn, i) => i ? turn : {
          ...turn, session: initial.sessionSettings,
          branchInfo: { sourceId: initial.currentConversationId, reason, createdAt, rootId: initial.currentLineage?.rootId || initial.currentConversationId, parentId: initial.currentLineage?.parentId }
        })
      };
      saveQueue = saveQueue.catch(() => {}).then(async () => {
        if (!isCurrent()) return;
        saved = await saveConversation(payload);
      });
      await saveQueue;
    }
    if (!isCurrent()) return false;
    if (!saved) throw new Error('旧剧情保存失败，当前内容未改动。请重试或先导出会话备份。');
    // Archive metadata belongs to the checkpoint, not to the working copy.
    const lineage = { rootId: restoredId ? next[0]?.branchInfo?.rootId || next[0]?.branchInfo?.sourceId || initial.currentConversationId : initial.currentLineage?.rootId || initial.currentConversationId, parentId: restoredId || (oldHistory.length ? archiveId : initial.currentLineage?.parentId) };
    const history = next.map((turn, i) => i ? turn : { ...turn, branchInfo: undefined, lineage });
    useAppStore.setState({ currentLineage: lineage });
    initial.setConversationHistory(history);
    void useAppStore.getState().autoSave();
    return true;
  } catch (error) {
    if (isCurrent()) useAppStore.setState({ saveError: error instanceof Error ? error.message : '分支操作失败，当前内容未改动。' });
    return false;
  } finally {
    useAppStore.setState({ isBranching: false });
  }
}

async function editCheckpoint(id: string, update: { name?: string; trashed?: boolean }): Promise<boolean> {
  const initial = useAppStore.getState();
  if (initial.isBranching || !isCheckpointId(id)) return false;
  useAppStore.setState({ isBranching: true, saveError: null });
  const sameUser = () => useAppStore.getState().currentUserId === initial.currentUserId;
  try {
    const saved = await fetchConversation(id);
    if (!sameUser()) return false;
    if (!saved?.history?.length || saved.user_id !== initial.currentUserId || saved.deck_id !== initial.currentDeckKey) throw new Error('分支不存在或不属于当前剧本');
    const original = saved.history[0].branchInfo || { sourceId: '', reason: saved.title || '旧分支', createdAt: saved.created_at || '' };
    const name = update.name === undefined ? original.name : update.name.trim().slice(0, 100);
    const info = { ...original, ...update, name };
    const payload = { id, user_id: saved.user_id, deck_id: saved.deck_id, deck_title: saved.deck_title || '', title: name || `${info.reason} · ${saved.history.length} 条消息`, history: saved.history.map((t,i)=>i?t:{...t,branchInfo:info}) };
    let ok = false;
    saveQueue = saveQueue.catch(()=>{}).then(async()=>{ if (sameUser()) ok = await saveConversation(payload); });
    await saveQueue;
    if (!sameUser()) return false;
    if (!ok) throw new Error('分支整理保存失败，请重试。');
    await initial.refreshSaves();
    return true;
  } catch (error) { if (sameUser()) useAppStore.setState({saveError:error instanceof Error?error.message:'分支整理失败'}); return false; }
  finally { useAppStore.setState({isBranching:false}); }
}
