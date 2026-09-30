-- Scanned business-card photos are stored as media attached to a contact.
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE media DROP CONSTRAINT IF EXISTS media_kind_check;
ALTER TABLE media ADD CONSTRAINT media_kind_check
  CHECK (kind IN ('profilePhoto', 'coverPhoto', 'companyLogo', 'contactCard'));

ALTER TABLE media DROP CONSTRAINT IF EXISTS media_attachment_scope_check;
ALTER TABLE media ADD CONSTRAINT media_attachment_scope_check
  CHECK (attachment_scope IN ('profile', 'card', 'contact'));

CREATE INDEX IF NOT EXISTS media_contact_id_idx ON media(contact_id);
