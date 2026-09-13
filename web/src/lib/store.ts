import { create } from 'zustand';
import { UserProfile, StoryDeck, Turn, ConversationSave, ModelSettings } from './types';
import { fetchConversations, saveConversation } from './api';

interface AppState {
  currentUserId: string;
  currentUser: UserProfile | null;
  currentDeckKey: string;
  currentDeck: StoryDeck | null;
  currentConversationId: string;
  conversationHistory: Turn[];
  savedConversations: ConversationSave[];
  modelSettings: ModelSettings;
  isSettingsOpen: boolean;
  isUserSwitchOpen: boolean;
  isDrawerOpen: boolean;

  setCurrentUserId: (id: string) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  setCurrentDeck: (deckKey: string, deck: StoryDeck | null) => void;
  setConversationHistory: (history: Turn[]) => void;
  setCurrentConversationId: (id: string) => void;
  addTurn: (turn: Turn) => void;
  updateTurn: (index: number, turn: Turn) => void;
  truncateHistory: (fromIndex: number) => void;
  setSavedConversations: (saves: ConversationSave[]) => void;
  setModelSettings: (settings: Partial<ModelSettings>) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsUserSwitchOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  refreshSaves: () => Promise<void>;
  startNewStory: (deck: StoryDeck) => void;
  autoSave: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUserId: typeof window !== 'undefined' ? localStorage.getItem('noval_user_id') || 'user_master' : 'user_master',
  currentUser: null,
  currentDeckKey: 'deck_coser_sister',
  currentDeck: null,
  currentConversationId: '',
  conversationHistory: [],
  savedConversations: [],
  modelSettings: {
    model: typeof window !== 'undefined' ? localStorage.getItem('rp_api_model') || 'deepseek-v3.2' : 'deepseek-v3.2',
    baseUrl: typeof window !== 'undefined' ? localStorage.getItem('rp_api_base_url') || 'https://api.openai.com/v1' : 'https://api.openai.com/v1',
    apiKey: typeof window !== 'undefined' ? localStorage.getItem('rp_api_key') || '' : '',
    temperature: 0.85,
    topP: 0.95
  },
  isSettingsOpen: false,
  isUserSwitchOpen: false,
  isDrawerOpen: false,

  setCurrentUserId: (id: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('noval_user_id', id);
    set({ currentUserId: id });
    get().refreshSaves();
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentDeck: (deckKey, deck) => set({ currentDeckKey: deckKey, currentDeck: deck }),
  setConversationHistory: (history) => set({ conversationHistory: history }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  
  addTurn: (turn) => {
    set((state) => ({ conversationHistory: [...state.conversationHistory, turn] }));
    get().autoSave();
  },

  updateTurn: (index, turn) => {
    set((state) => {
      const next = [...state.conversationHistory];
      next[index] = turn;
      return { conversationHistory: next };
    });
    get().autoSave();
  },

  truncateHistory: (fromIndex) => {
    set((state) => ({ conversationHistory: state.conversationHistory.slice(0, fromIndex) }));
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
      }
      return { modelSettings: updated };
    });
  },

  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setIsUserSwitchOpen: (open) => set({ isUserSwitchOpen: open }),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),

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
    if (!currentConversationId || conversationHistory.length === 0) return;

    const payload = {
      id: currentConversationId,
      user_id: currentUserId,
      deck_id: currentDeckKey,
      deck_title: currentDeck?.title || '中式人生',
      title: conversationHistory[conversationHistory.length - 1]?.location || `${currentDeck?.title || '剧本'} · 第 ${conversationHistory.length} 幕`,
      history: conversationHistory
    };

    await saveConversation(payload);
    get().refreshSaves();
  }
}));
