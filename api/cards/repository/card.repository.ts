import type { Queryable } from '../../src/types.js';

export type CardRow = { id: string; user_id: string; data: Record<string, unknown>; is_primary: boolean; created_at: Date; updated_at: Date };
export class CardRepository {
  constructor(private readonly db: Queryable) {}
  list(userId: string) { return this.db.query<CardRow>('SELECT * FROM cards WHERE user_id=$1 ORDER BY is_primary DESC, created_at', [userId]).then(r => r.rows); }
  find(userId: string, id: string) { return this.db.query<CardRow>('SELECT * FROM cards WHERE id=$1 AND user_id=$2', [id, userId]).then(r => r.rows[0] ?? null); }
  create(userId: string, data: Record<string, unknown>) { return this.db.query<CardRow>('INSERT INTO cards(user_id,data,is_primary) SELECT $1,$2,NOT EXISTS(SELECT 1 FROM cards WHERE user_id=$1) RETURNING *', [userId, data]).then(r => r.rows[0]!); }
  update(userId: string, id: string, data: Record<string, unknown>) { return this.db.query<CardRow>('UPDATE cards SET data=data || $3::jsonb, updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId, data]).then(r => r.rows[0] ?? null); }
  delete(userId: string, id: string) {
    // Clear Apple Wallet device registrations for this card before removing the row.
    // Cast separately: serial_number is text, cards.id is uuid (same bind cannot be both).
    return this.db.query(
      `WITH w AS (DELETE FROM wallet_registrations WHERE serial_number = $1::text)
       DELETE FROM cards WHERE id = $1::uuid AND user_id = $2::uuid`,
      [id, userId],
    ).then((r) => (r.rowCount ?? 0) > 0);
  }
  setPrimary(userId: string, id: string) {
    return this.db.query<CardRow>(
      'SELECT * FROM set_primary_card($1,$2)',
      [userId, id],
    ).then(result => result.rows[0] ?? null);
  }
}
