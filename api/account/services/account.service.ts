import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';
import type { MediaService } from '../../media/services/media.service.js';
import type { AccountRepository } from '../repository/account.repository.js';

export class AccountService {
  constructor(private readonly repository: AccountRepository, private readonly media: MediaService) {}

  /**
   * Stored files first, then application data, then the Supabase identity.
   * Partial failure is logged so support can finish cleanup; the client gets a stable 502.
   */
  async delete(userId: string) {
    try {
      await this.media.purgeUser(userId);
      await this.repository.purgeData(userId);
      await this.repository.deleteAuthUser(userId);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      log('error', 'account_delete_partial', {
        userId,
        message: error instanceof Error ? error.message : String(error),
      });
      throw new HttpError(502, 'Account could not be fully deleted. Try again or contact support.');
    }
  }
}
