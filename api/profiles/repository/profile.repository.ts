import type { Queryable } from '../../src/types.js';

type ProfileRow = { user_id: string; data: Record<string, unknown>; created_at: Date; updated_at: Date };

export class ProfileRepository {
  constructor(private readonly db: Queryable) {}
  async find(userId: string) {
    const result = await this.db.query<ProfileRow>('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    return result.rows[0] ?? null;
  }
  async upsert(userId: string, data: Record<string, unknown>) {
    const result = await this.db.query<ProfileRow>(
      `INSERT INTO profiles (user_id, data) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING *`, [userId, data],
    );
    return result.rows[0]!;
  }
}
