ALTER TABLE line_users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;
ALTER TABLE line_users ADD COLUMN conversation_mode TEXT;

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_user_id TEXT NOT NULL,
  user_language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiry_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id INTEGER NOT NULL,
  sender TEXT NOT NULL,
  original_language TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_updated
  ON inquiries(line_user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry
  ON inquiry_messages(inquiry_id, created_at);

CREATE TABLE IF NOT EXISTS rich_menus (
  language TEXT PRIMARY KEY,
  rich_menu_id TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS translations (
  cache_key TEXT PRIMARY KEY,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
