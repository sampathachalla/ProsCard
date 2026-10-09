import { HttpError } from '../../src/errors.js';
import type { MediaService } from '../../media/services/media.service.js';
import type { ContactRepository } from '../repository/contact.repository.js';

const shape = (r: {
  id: string;
  source_card_id: string | null;
  data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}) => ({
  id: r.id,
  ...r.data,
  sourceCardId: r.source_card_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export class ContactService {
  constructor(private readonly repo: ContactRepository, private readonly media?: MediaService) {}

  async list(u: string) {
    return (await this.repo.list(u)).map(shape);
  }

  async get(u: string, id: string) {
    const r = await this.repo.find(u, id);
    if (!r) throw new HttpError(404, 'Contact not found.');
    return shape(r);
  }

  async create(u: string, input: Record<string, unknown>) {
    const { sourceCardId, ...data } = input;
    const source = typeof sourceCardId === 'string' ? sourceCardId : null;
    if (source && !await this.repo.cardOwned(u, source)) {
      throw new HttpError(404, 'Source card not found.');
    }
    return shape(await this.repo.create(u, data, source));
  }

  async update(u: string, id: string, d: Record<string, unknown>) {
    const r = await this.repo.update(u, id, d);
    if (!r) throw new HttpError(404, 'Contact not found.');
    return shape(r);
  }

  async delete(u: string, id: string) {
    if (!await this.repo.find(u, id)) throw new HttpError(404, 'Contact not found.');
    await this.media?.cleanupContact(u, id);
    if (!await this.repo.delete(u, id)) throw new HttpError(404, 'Contact not found.');
  }
}
