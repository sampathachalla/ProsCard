CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding (
  user_id UUID PRIMARY KEY,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON cards(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS cards_one_primary_per_user_idx ON cards(user_id) WHERE is_primary = true;

CREATE OR REPLACE FUNCTION set_primary_card(p_user_id UUID, p_card_id UUID)
RETURNS SETOF cards
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cards WHERE user_id = p_user_id AND id = p_card_id) THEN
    RETURN;
  END IF;
  UPDATE cards SET is_primary = false WHERE user_id = p_user_id AND is_primary = true AND id <> p_card_id;
  RETURN QUERY UPDATE cards SET is_primary = true, updated_at = now() WHERE user_id = p_user_id AND id = p_card_id RETURNING *;
END;
$$;

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_card_id UUID,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_card_id)
);
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);

CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shares_card_id_idx ON shares(card_id);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  object_name TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('profilePhoto', 'coverPhoto', 'companyLogo', 'contactCard')),
  attachment_scope TEXT NOT NULL DEFAULT 'profile' CHECK (attachment_scope IN ('profile', 'card', 'contact')),
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'cleanup_failed')),
  content_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS media_user_id_idx ON media(user_id);
CREATE INDEX IF NOT EXISTS media_card_id_idx ON media(card_id);
CREATE INDEX IF NOT EXISTS media_contact_id_idx ON media(contact_id);
