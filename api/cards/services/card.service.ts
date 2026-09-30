import { HttpError } from '../../src/errors.js';
import type { CardRepository, CardRow } from '../repository/card.repository.js';
import type { MediaService } from '../../media/services/media.service.js';

const shape = (row: CardRow) => ({ id: row.id, ...row.data, isPrimary: row.is_primary, createdAt: row.created_at, updatedAt: row.updated_at });
export class CardService {
  constructor(private readonly repository: CardRepository, private readonly media?: MediaService) {}
  async list(userId: string) { return (await this.repository.list(userId)).map(shape); }
  async get(userId: string, id: string) { const row = await this.repository.find(userId, id); if (!row) throw new HttpError(404, 'Card not found.'); return shape(row); }
  async create(userId: string, data: Record<string, unknown>) { return shape(await this.repository.create(userId, data)); }
  async update(userId: string, id: string, data: Record<string, unknown>) { const row = await this.repository.update(userId, id, data); if (!row) throw new HttpError(404, 'Card not found.'); return shape(row); }
  async setPrimary(userId: string, id: string) { const row = await this.repository.setPrimary(userId, id); if (!row) throw new HttpError(404, 'Card not found.'); return shape(row); }
  async delete(userId: string, id: string) {
    const card = await this.repository.find(userId, id);
    if (!card) throw new HttpError(404, 'Card not found.');
    if (card.is_primary) throw new HttpError(409, 'The primary card cannot be deleted. Make another card primary first.');
    await this.media?.cleanupCard(userId, id);
    if (!await this.repository.delete(userId, id)) throw new HttpError(404, 'Card not found.');
  }
}
