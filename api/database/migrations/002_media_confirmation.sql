ALTER TABLE media ADD COLUMN IF NOT EXISTS kind TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

UPDATE media
SET kind = CASE
  WHEN object_name LIKE '%/coverPhoto/%' THEN 'coverPhoto'
  WHEN object_name LIKE '%/companyLogo/%' THEN 'companyLogo'
  ELSE 'profilePhoto'
END
WHERE kind IS NULL;

ALTER TABLE media ALTER COLUMN kind SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE media ADD CONSTRAINT media_kind_check CHECK (kind IN ('profilePhoto', 'coverPhoto', 'companyLogo'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE media ADD CONSTRAINT media_status_check CHECK (status IN ('pending', 'ready'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
