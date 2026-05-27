CREATE TABLE IF NOT EXISTS waitlist (
  email TEXT PRIMARY KEY,
  instrument_interest TEXT,
  consent_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'landing-cta',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist (created_at);
