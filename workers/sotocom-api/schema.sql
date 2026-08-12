CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  line_user_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  author_nationality_code TEXT,
  author_nationality_label TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created
  ON submissions(status, created_at DESC);

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
