CREATE OR REPLACE FUNCTION set_primary_card(p_user_id UUID, p_card_id UUID)
RETURNS SETOF cards
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cards WHERE user_id = p_user_id AND id = p_card_id) THEN
    RETURN;
  END IF;

  UPDATE cards
  SET is_primary = false
  WHERE user_id = p_user_id AND is_primary = true AND id <> p_card_id;

  RETURN QUERY
  UPDATE cards
  SET is_primary = true, updated_at = now()
  WHERE user_id = p_user_id AND id = p_card_id
  RETURNING *;
END;
$$;
