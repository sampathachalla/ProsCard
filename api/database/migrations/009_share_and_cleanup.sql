-- One reusable (non-expiring) active share per card — prevents duplicate links from concurrent creates.
-- Keep the newest active non-expiring share when duplicates already exist.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, card_id
           ORDER BY created_at DESC
         ) AS rn
  FROM shares
  WHERE is_active = true AND expires_at IS NULL
)
UPDATE shares
SET is_active = false
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX IF NOT EXISTS shares_one_active_reusable_idx
  ON shares (user_id, card_id)
  WHERE is_active = true AND expires_at IS NULL;
