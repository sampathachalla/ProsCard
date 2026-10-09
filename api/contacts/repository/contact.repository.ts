import type { Queryable } from '../../src/types.js';

type Row = {
  id: string;
  user_id: string;
  source_card_id: string | null;
  data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
};

export class ContactRepository {
  constructor(private readonly db: Queryable) {}

  list(u: string) {
    return this.db.query<Row>('SELECT * FROM contacts WHERE user_id=$1 ORDER BY created_at DESC', [u]).then((r) => r.rows);
  }

  find(u: string, id: string) {
    return this.db.query<Row>('SELECT * FROM contacts WHERE id=$1 AND user_id=$2', [id, u]).then((r) => r.rows[0] ?? null);
  }

  cardOwned(u: string, cardId: string) {
    return this.db.query('SELECT 1 FROM cards WHERE id=$1 AND user_id=$2', [cardId, u]).then((r) => (r.rowCount ?? 0) > 0);
  }

  create(u: string, d: Record<string, unknown>, source: string | null) {
    return this.db.query<Row>(
      'INSERT INTO contacts(user_id,data,source_card_id) VALUES($1,$2,$3) ON CONFLICT(user_id,source_card_id) DO UPDATE SET data=EXCLUDED.data,updated_at=now() RETURNING *',
      [u, d, source],
    ).then((r) => r.rows[0]!);
  }

  update(u: string, id: string, d: Record<string, unknown>) {
    return this.db.query<Row>(
      'UPDATE contacts SET data=data || $3::jsonb,updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *',
      [id, u, d],
    ).then((r) => r.rows[0] ?? null);
  }

  delete(u: string, id: string) {
    return this.db.query('DELETE FROM contacts WHERE id=$1 AND user_id=$2', [id, u]).then((r) => (r.rowCount ?? 0) > 0);
  }
}
