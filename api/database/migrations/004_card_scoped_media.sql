ALTER TABLE media
  ADD COLUMN IF NOT EXISTS attachment_scope TEXT NOT NULL DEFAULT 'profile',
  ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES cards(id) ON DELETE SET NULL;

DO $$ BEGIN
  ALTER TABLE media ADD CONSTRAINT media_attachment_scope_check
    CHECK (attachment_scope IN ('profile', 'card'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS media_card_id_idx ON media(card_id);
CREATE INDEX IF NOT EXISTS media_attachment_target_idx
  ON media(user_id, attachment_scope, card_id, kind);
