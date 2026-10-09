import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import type { Queryable } from '../../src/types.js';

export class AccountRepository {
  constructor(private readonly db: Queryable, private readonly supabase: SupabaseClient) {}

  /**
   * Removes all application rows for the user in one atomic statement.
   * Wallet registrations are cleared before cards; leftover media rows (after purgeUser) are removed last among dependents.
   */
  purgeData(userId: string) {
    return this.db.query(
      `WITH w AS (
         DELETE FROM wallet_registrations wr
         USING cards c
         WHERE wr.serial_number = c.id::text AND c.user_id = $1
       ),
       s AS (DELETE FROM shares WHERE user_id = $1),
       ct AS (DELETE FROM contacts WHERE user_id = $1),
       cd AS (DELETE FROM cards WHERE user_id = $1),
       o AS (DELETE FROM onboarding WHERE user_id = $1),
       m AS (DELETE FROM media WHERE user_id = $1)
       DELETE FROM profiles WHERE user_id = $1`,
      [userId],
    );
  }

  async deleteAuthUser(userId: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) {
      log('warn', 'supabase_delete_user_failed', { userId, message: error.message, status: error.status });
      throw new HttpError(error.status ?? 502, 'Could not delete the account identity. Try again or contact support.');
    }
  }
}
