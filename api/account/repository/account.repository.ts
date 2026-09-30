import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../../src/errors.js';
import type { Queryable } from '../../src/types.js';

export class AccountRepository {
  constructor(private readonly db: Queryable, private readonly supabase: SupabaseClient) {}

  /** Removes all application rows for the user in one atomic statement. Media rows are handled by MediaService. */
  purgeData(userId: string) {
    return this.db.query(
      `WITH s AS (DELETE FROM shares WHERE user_id=$1),
            c AS (DELETE FROM contacts WHERE user_id=$1),
            cd AS (DELETE FROM cards WHERE user_id=$1),
            o AS (DELETE FROM onboarding WHERE user_id=$1)
       DELETE FROM profiles WHERE user_id=$1`,
      [userId],
    );
  }

  async deleteAuthUser(userId: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) throw new HttpError(error.status ?? 502, error.message);
  }
}
