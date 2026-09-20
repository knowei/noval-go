-- =============================================================================
-- NOVAL-GO 规范化数据库架构表结构定义 (PostgreSQL / Supabase 规范)
-- =============================================================================

-- 1. 用户与凭据主表 (Users & Credentials)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT DEFAULT '风月旅行者',
    avatar TEXT DEFAULT '🎭',
    points INTEGER DEFAULT 9999,
    model_config_json TEXT DEFAULT '{}',
    auth_token TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_auth_token ON users(auth_token);

-- 2. 会话与多剧本存档表 (Conversations & Save Slots)
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    deck_id TEXT NOT NULL,
    deck_title TEXT DEFAULT '',
    title TEXT DEFAULT '新场景存档',
    history_json TEXT,
    turn_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deck_id ON conversations(deck_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- 3. 剧本设定与开卷手册主表 (Story Decks & Handbooks)
CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    badge TEXT DEFAULT '经典必玩',
    cover_icon TEXT DEFAULT '📖',
    cover_title TEXT,
    cover_subtitle TEXT,
    logo TEXT DEFAULT '📖',
    theme_color TEXT DEFAULT 'rose',
    btn_gradient TEXT DEFAULT 'from-rose-600 to-pink-600',
    handbook_json TEXT,
    roles_json TEXT,
    scenes_json TEXT,
    styles_json TEXT,
    first_turn_demo_json TEXT,
    custom_css TEXT DEFAULT '',
    custom_html TEXT DEFAULT '',
    category TEXT DEFAULT '都市',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 探索广场展示卡片库 (Plaza Cards)
CREATE TABLE IF NOT EXISTS plaza_cards (
    id TEXT PRIMARY KEY,
    deck_id TEXT,
    title TEXT UNIQUE NOT NULL,
    badge TEXT DEFAULT '探索精选',
    badge_color TEXT DEFAULT 'rose',
    author TEXT DEFAULT '风月剧作组',
    "desc" TEXT,
    rating TEXT DEFAULT '5.0',
    tags_json TEXT,
    heat TEXT DEFAULT '9.9w',
    order_index INTEGER DEFAULT 0,
    cover_image TEXT DEFAULT '',
    image_tag TEXT DEFAULT '',
    badge_type TEXT DEFAULT 'fire',
    is_featured INTEGER DEFAULT 0,
    category TEXT DEFAULT '都市',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_plaza_cards_order ON plaza_cards(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_plaza_cards_category ON plaza_cards(category);

-- 5. 系统通知与公告表 (System Notices)
CREATE TABLE IF NOT EXISTS system_notices (
    id TEXT PRIMARY KEY,
    notice_type TEXT DEFAULT 'announcement',
    title TEXT NOT NULL,
    content TEXT,
    countdown_seconds INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);
