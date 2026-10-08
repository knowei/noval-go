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
  imageOriginId?: string;
  illustrations?: import('./illustrations').Illustration[];
  branchInfo?: { sourceId: string; reason: string; createdAt: string; rootId?: string; parentId?: string; name?: string; trashed?: boolean };
  lineage?: { rootId: string; parentId?: string };
  session?: import('./sessionEngine').SessionSettings;
  snapshot?: import('./sessionEngine').SessionSnapshot;
  runtimeVersion?: 1;
  runtimeWarnings?: string[];
  incomplete?: boolean;
  completion?: { reason: string; responseTokens: number; protocolVersion?: 2; receivedChars?: number; elapsedMs?: number; repairs?: number; usage?: { promptTokens?: number; completionTokens?: number; reasoningTokens?: number } };
  displayText?: string;
  isUser?: boolean;
  text?: string;
  story?: string;
  rawText?: string;
  model?: string;
  location?: string;
  memory?: string[];
  memoryEntries?: import('./memoryResolution').MemoryEntry[];
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
  title?: string;
  desc?: string;
  audience?: string[];
  tips?: string[];
  quote?: string;
  originHtml?: string;
  castHtml?: string;
  opening_options?: string[];
  [key: string]: any;
}

export interface LoreEntry {
  secondaryKeys?: string[];
  secondaryMode?: 'andAny' | 'andAll' | 'notAny' | 'notAll';
  probability?: number;
  group?: string;
  groupWeight?: number;
  groupPriority?: boolean;
  recursive?: boolean;
  excludeRecursion?: boolean;
  constant?: boolean;
  priority?: number;
  scanDepth?: number;
  position?: 'early' | 'late';
  id: string;
  keys: string[];
  title: string;
  content: string;
  category?: 'item' | 'character' | 'location' | 'secret' | 'rule';
  enabled?: boolean;
}

export interface StoryDeck {
  characterName?: string;
  roles?: unknown[];
  exampleDialogue?: string;
  postHistoryInstructions?: string;
  alternateGreetings?: string[];
  sessionDefaults?: Partial<import('./sessionEngine').SessionSettings>;
  sourceCard?: unknown;
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
  systemPrompt?: string;
  statusTemplate?: string;
  cgMap?: Record<string, string>;
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
  branch_info?: Turn['branchInfo'];
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
  affectionGauge?: boolean;
  rpgAdventureHud?: boolean;
  lorebookArbiter?: boolean;
  phaseLock?: boolean;
  sceneIncidents?: boolean;
  haremIntimacyRecord?: boolean;
}

export interface CharacterIntimacyRecord {
  characterName: string;
  avatar?: string;
  tag?: string;
  relation: string;
  favor: number;
  mood: string;
  kissCount: number;
  oralCount: number;
  sexCount: number;
  creampieCount: number;
  orgasmCount: number;
  firstTimeLost?: boolean;
  sensitivePoints?: string[];
  specialEvents?: string[];
  defenseStage?: string;
}

export interface LoveStatusData {
  character?: string;
  affection: number;
  stage?: string;
  defense: number;
  permission?: string;
}

export interface RpgStatusData {
  realm?: string;
  hp?: string;
  mp?: string;
  inventory?: string[];
  loot?: string;
}

export interface ScenePhaseData {
  phaseName: string;
  progress: number;
  task: string;
  unlockCondition?: string;
}


