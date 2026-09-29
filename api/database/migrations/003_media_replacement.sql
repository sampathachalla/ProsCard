ALTER TABLE media DROP CONSTRAINT IF EXISTS media_status_check;
ALTER TABLE media ADD CONSTRAINT media_status_check
  CHECK (status IN ('pending', 'ready', 'cleanup_failed'));
