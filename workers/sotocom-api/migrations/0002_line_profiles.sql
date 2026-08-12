CREATE TABLE IF NOT EXISTS line_users (
  line_user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_key TEXT,
  default_avatar INTEGER NOT NULL DEFAULT 1,
  nationality_code TEXT,
  nationality_label TEXT,
  language TEXT,
  onboarding_step TEXT NOT NULL DEFAULT 'language',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE submissions ADD COLUMN avatar_url TEXT;
ALTER TABLE submissions ADD COLUMN author_nationality_code TEXT;
ALTER TABLE submissions ADD COLUMN author_nationality_label TEXT;
