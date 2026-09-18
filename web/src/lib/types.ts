export interface Branch {
  tag?: string;
  title: string;
  desc?: string;
}

export interface TurnStatus {
  clothes?: string;
  posture?: string;
  stats?: string;
  risk?: string;
  health?: number | string;
  stamina?: number | string;
  hydration?: number | string;
  satiety?: number | string;
  battery?: number | string;
  infection?: number | string;
  inventory?: string[];
  threatLevel?: string;
  [key: string]: any;
}

export interface Turn {
  isUser?: boolean;
  text?: string;
  story?: string;
  rawText?: string;
  model?: string;
  location?: string;
  memory?: string[];
  status?: TurnStatus;
  branches?: Branch[];
  npcThought?: string;
  npcClothes?: string;
  modifyEffect?: string;
  modReport?: string;
  rawOutputSnippet?: string;
  cot?: string;
  tl?: string;
  activeLoreEntries?: LoreEntry[];
  swipes?: Turn[];
  swipeIndex?: number;
  isError?: boolean;
  error?: string;
}

export interface StoryScene {
  title: string;
  desc: string;
}

export interface StoryHandbook {
  audience?: string[];
  tips?: string[];
  quote?: string;
  originHtml?: string;
  castHtml?: string;
}

export interface LoreEntry {
  id: string;
  keys: string[];
  title: string;
  content: string;
  category?: 'item' | 'character' | 'location' | 'secret' | 'rule';
  enabled?: boolean;
}

export interface StoryDeck {
  id: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  coverIcon?: string;
  coverTitle?: string;
  coverSubtitle?: string;
  logo?: string;
  themeColor?: string;
  btnGradient?: string;
  scenes?: StoryScene[];
  firstTurnDemo?: Turn;
  handbook?: StoryHandbook;
  lorebook?: LoreEntry[];
  customCss?: string;
  customHtml?: string;
  desc?: string;
  author?: string;
  rating?: string;
  heat?: string;
  tags?: string[];
  category?: string;
  cover_image?: string;
}

export interface PlazaCard {
  id: string;
  deckKey?: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  author?: string;
  desc?: string;
  rating?: string;
  cover_image?: string;
  image_tag?: string;
  heat?: string;
  tags?: string[];
  category?: string;
  badge_type?: string;
  is_featured?: number;
}

export interface ConversationSave {
  id: string;
  user_id: string;
  deck_id: string;
  deck_title?: string;
  title?: string;
  turn_count?: number;
  created_at?: string;
  updated_at?: string;
  history?: Turn[];
}

export interface ModelSettings {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  roleplayMode?: 'realistic' | 'unrestricted';
}

export interface UserProfile {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  points?: number;
  is_guest?: boolean;
  current_model?: string;
  model_settings?: ModelSettings;
}

export interface EnabledMods {
  apocalypseSurvival: boolean;
  antiCoercion: boolean;
  innerVoice: boolean;
  explorationBranches: boolean;
}

