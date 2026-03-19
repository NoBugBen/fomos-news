PRAGMA foreign_keys = ON;

CREATE TABLE news_items (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    category TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    published_at TEXT NOT NULL,
    ingested_at TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    is_hot INTEGER NOT NULL DEFAULT 0 CHECK (is_hot IN (0, 1)),
    dedupe_key TEXT NOT NULL UNIQUE,
    content_hash TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'zh-CN',
    author TEXT
);

CREATE TABLE news_tags (
    news_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (news_id, tag),
    FOREIGN KEY (news_id) REFERENCES news_items(id) ON DELETE CASCADE
);

CREATE TABLE briefings (
    id TEXT PRIMARY KEY,
    briefing_date TEXT NOT NULL UNIQUE,
    display_date TEXT NOT NULL,
    analysis_trend TEXT NOT NULL,
    analysis_competition TEXT NOT NULL,
    analysis_demand TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE briefing_sections (
    id TEXT PRIMARY KEY,
    briefing_id TEXT NOT NULL,
    title TEXT NOT NULL,
    emoji TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (briefing_id) REFERENCES briefings(id) ON DELETE CASCADE,
    UNIQUE (briefing_id, sort_order)
);

CREATE TABLE briefing_section_items (
    id TEXT PRIMARY KEY,
    section_id TEXT NOT NULL,
    rank INTEGER NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    display_date TEXT NOT NULL,
    summary TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    category_label TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES briefing_sections(id) ON DELETE CASCADE,
    UNIQUE (section_id, rank)
);

CREATE TABLE subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'site_modal',
    created_at TEXT NOT NULL,
    confirmed_at TEXT,
    unsubscribed_at TEXT
);

CREATE TABLE admin_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_news_items_published_at_id
    ON news_items (published_at DESC, id DESC);

CREATE INDEX idx_news_items_category_published_at_id
    ON news_items (category, published_at DESC, id DESC);

CREATE INDEX idx_news_items_hot_published_at_id
    ON news_items (is_hot, published_at DESC, id DESC);

CREATE INDEX idx_news_tags_tag_news_id
    ON news_tags (tag, news_id);

CREATE INDEX idx_briefings_briefing_date
    ON briefings (briefing_date DESC);

CREATE INDEX idx_briefing_sections_briefing_id_sort_order
    ON briefing_sections (briefing_id, sort_order);

CREATE INDEX idx_briefing_section_items_section_id_rank
    ON briefing_section_items (section_id, rank);

CREATE INDEX idx_subscribers_status_created_at
    ON subscribers (status, created_at DESC);

CREATE INDEX idx_admin_sessions_user_id
    ON admin_sessions (user_id);

CREATE INDEX idx_admin_sessions_expires_at
    ON admin_sessions (expires_at);
