import type { MediaService } from '../../media/services/media.service.js';
import type { AccountRepository } from '../repository/account.repository.js';

export class AccountService {
  constructor(private readonly repository: AccountRepository, private readonly media: MediaService) {}

  /** Stored files first, then application data, then the Supabase identity. */
  async delete(userId: string) {
    await this.media.purgeUser(userId);
    await this.repository.purgeData(userId);
    await this.repository.deleteAuthUser(userId);
  }
}
