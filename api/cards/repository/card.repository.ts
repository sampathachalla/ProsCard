import type { Queryable } from '../../src/types.js';

type CardRow = { id: string; user_id: string; data: Record<string, unknown>; created_at: Date; updated_at: Date };
export class CardRepository {
  constructor(private readonly db: Queryable) {}
  list(userId: string) { return this.db.query<CardRow>('SELECT * FROM cards WHERE user_id=$1 ORDER BY created_at', [userId]).then(r => r.rows); }
  find(userId: string, id: string) { return this.db.query<CardRow>('SELECT * FROM cards WHERE id=$1 AND user_id=$2', [id, userId]).then(r => r.rows[0] ?? null); }
  create(userId: string, data: Record<string, unknown>) { return this.db.query<CardRow>('INSERT INTO cards(user_id,data) VALUES($1,$2) RETURNING *', [userId, data]).then(r => r.rows[0]!); }
  update(userId: string, id: string, data: Record<string, unknown>) { return this.db.query<CardRow>('UPDATE cards SET data=data || $3::jsonb, updated_at=now() WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId, data]).then(r => r.rows[0] ?? null); }
  delete(userId: string, id: string) { return this.db.query('DELETE FROM cards WHERE id=$1 AND user_id=$2', [id, userId]).then(r => (r.rowCount ?? 0) > 0); }
}
