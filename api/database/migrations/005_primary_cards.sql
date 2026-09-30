ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at, id) AS position
  FROM cards
)
UPDATE cards
SET is_primary = true
FROM ranked
WHERE cards.id = ranked.id
  AND ranked.position = 1
  AND NOT EXISTS (
    SELECT 1 FROM cards existing
    WHERE existing.user_id = cards.user_id AND existing.is_primary = true
  );

CREATE UNIQUE INDEX IF NOT EXISTS cards_one_primary_per_user_idx
  ON cards(user_id)
  WHERE is_primary = true;
