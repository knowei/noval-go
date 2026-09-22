import { create } from 'zustand';
import { UserProfile, StoryDeck, Turn, ConversationSave, ModelSettings, EnabledMods } from './types';
import { fetchConversations, saveConversation } from './api';

const defaultMods: EnabledMods = {
  apocalypseSurvival: true,
  antiCoercion: true,
  innerVoice: true,
  explorationBranches: true,
  affectionGauge: false,
  rpgAdventureHud: false,
  lorebookArbiter: true,
  phaseLock: true,
  sceneIncidents: true,
};

const getInitialMods = (): EnabledMods => {
  if (typeof window === 'undefined') return defaultMods;
  try {
    const raw = localStorage.getItem('rp_enabled_mods');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apocalypseSurvival: parsed.apocalypseSurvival ?? true,
        antiCoercion: parsed.antiCoercion ?? true,
        innerVoice: parsed.innerVoice ?? true,
        explorationBranches: parsed.explorationBranches ?? true,
        affectionGauge: parsed.affectionGauge ?? false,
        rpgAdventureHud: parsed.rpgAdventureHud ?? false,
        lorebookArbiter: parsed.lorebookArbiter ?? true,
        phaseLock: parsed.phaseLock ?? true,
        sceneIncidents: parsed.sceneIncidents ?? true,
      };
    }
  } catch (e) {
    // fallback
  }
  return defaultMods;
};

const getOrCreateUserId = (): string => {
  if (typeof window === 'undefined') return 'guest_default';
  let uid = localStorage.getItem('rp_current_user_id') || localStorage.getItem('noval_user_id');
  if (!uid || uid === 'default_user') {
    uid = 'guest_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('rp_current_user_id', uid);
    localStorage.setItem('noval_user_id', uid);
  }
  return uid;
};

interface AppState {
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

  setCurrentUserId: (id: string) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  setCurrentDeck: (deckKey: string, deck: StoryDeck | null) => void;
  setConversationHistory: (history: Turn[]) => void;
  setCurrentConversationId: (id: string) => void;
  addTurn: (turn: Turn) => void;
  updateTurn: (index: number, turn: Partial<Turn>) => void;
  truncateHistory: (fromIndex: number) => void;
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
    conversationHistory: Array.isArray(history)
      ? history.filter((t): t is Turn => Boolean(t && typeof t === 'object'))
      : []
  }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  
  addTurn: (turn) => {
    if (!turn) return;
    set((state) => ({ conversationHistory: [...state.conversationHistory.filter(Boolean), turn] }));
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
    get().autoSave();
  },

  truncateHistory: (fromIndex) => {
    set((state) => ({ conversationHistory: state.conversationHistory.slice(0, fromIndex).filter(Boolean) }));
    get().autoSave();
  },

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
    set({ savedConversations: saves });
  },

  startNewStory: (deck: StoryDeck) => {
    const newId = 'conv_' + Date.now();
    let initialHistory: Turn[] = [];

    if (deck.firstTurnDemo && deck.firstTurnDemo.story) {
      initialHistory = [{
        isUser: false,
        model: get().modelSettings.model || '原作者官方预设',
        location: deck.firstTurnDemo.location || deck.title,
        story: deck.firstTurnDemo.story,
        memory: deck.firstTurnDemo.memory || [],
        status: deck.firstTurnDemo.status || {},
        branches: deck.firstTurnDemo.branches || [
          { tag: 'A', title: '谨慎观察', desc: '顺应当前情境小心试探' },
          { tag: 'B', title: '掌握主动', desc: '采取坚决行动引导局势' }
        ]
      }];
    } else {
      const scene = (deck.scenes && deck.scenes[0]) || { title: deck.title, desc: `你已正式进入【${deck.title}】的世界……` };
      initialHistory = [{
        isUser: false,
        model: get().modelSettings.model || '原作者官方预设',
        location: scene.title,
        story: scene.desc,
        branches: [
          { tag: 'A', title: '观察周遭', desc: '谨慎打量当前空间的动静与线索' },
          { tag: 'B', title: '主动对话', desc: '上前与核心人物打破沉默，展开深入交互' }
        ]
      }];
    }

    set({
      currentDeckKey: deck.id,
      currentDeck: deck,
      currentConversationId: newId,
      conversationHistory: initialHistory
    });

    get().autoSave();
  },

  autoSave: async () => {
    const { currentConversationId, currentUserId, currentDeckKey, currentDeck, conversationHistory } = get();
    const cleanHistory = (conversationHistory || []).filter((t): t is Turn => Boolean(t && typeof t === 'object'));
    if (!currentConversationId || cleanHistory.length === 0) return;

    const lastTurn = cleanHistory[cleanHistory.length - 1];
    const payload = {
      id: currentConversationId,
      user_id: currentUserId,
      deck_id: currentDeckKey,
      deck_title: currentDeck?.title || '中式人生',
      title: lastTurn?.location || `${currentDeck?.title || '剧本'} · 第 ${cleanHistory.length} 幕`,
      history: cleanHistory
    };

    await saveConversation(payload);
    get().refreshSaves();
  }
}));
