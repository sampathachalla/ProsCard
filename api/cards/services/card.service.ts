import { HttpError } from '../../src/errors.js';
import type { CardRepository } from '../repository/card.repository.js';

const shape = (row: { id: string; data: Record<string, unknown>; created_at: Date; updated_at: Date }) => ({ id: row.id, ...row.data, createdAt: row.created_at, updatedAt: row.updated_at });
export class CardService {
  constructor(private readonly repository: CardRepository) {}
  async list(userId: string) { return (await this.repository.list(userId)).map(shape); }
  async get(userId: string, id: string) { const row = await this.repository.find(userId, id); if (!row) throw new HttpError(404, 'Card not found.'); return shape(row); }
  async create(userId: string, data: Record<string, unknown>) { return shape(await this.repository.create(userId, data)); }
  async update(userId: string, id: string, data: Record<string, unknown>) { const row = await this.repository.update(userId, id, data); if (!row) throw new HttpError(404, 'Card not found.'); return shape(row); }
  async delete(userId: string, id: string) { if (!await this.repository.delete(userId, id)) throw new HttpError(404, 'Card not found.'); }
}
