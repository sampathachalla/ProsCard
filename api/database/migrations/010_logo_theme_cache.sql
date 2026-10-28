CREATE TABLE IF NOT EXISTS logo_theme_cache (
  content_hash TEXT PRIMARY KEY,
  source_keys TEXT[] NOT NULL DEFAULT '{}',
  palette JSONB NOT NULL,
  hit_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (content_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS logo_theme_cache_source_keys_idx
  ON logo_theme_cache USING GIN(source_keys);
