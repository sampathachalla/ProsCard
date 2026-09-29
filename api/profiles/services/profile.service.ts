import type { ProfileRepository } from '../repository/profile.repository.js';

export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}
  async get(userId: string) {
    const row = await this.repository.find(userId);
    return row ? { ...row.data, userId: row.user_id, updatedAt: row.updated_at } : null;
  }
  async save(userId: string, profile: Record<string, unknown>) {
    const row = await this.repository.upsert(userId, profile);
    return { ...row.data, userId: row.user_id, updatedAt: row.updated_at };
  }
}
