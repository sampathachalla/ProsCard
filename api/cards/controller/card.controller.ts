import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { CardService } from '../services/card.service.js';
import { cardPatchSchema, cardSchema } from '../utils/card.schemas.js';

export class CardController {
  constructor(private readonly service: CardService) {}
  list = async (req: AuthenticatedRequest, res: Response) => res.json(await this.service.list(req.user.id));
  get = async (req: AuthenticatedRequest, res: Response) => res.json(await this.service.get(req.user.id, req.params.id as string));
  create = async (req: AuthenticatedRequest, res: Response) => res.status(201).json(await this.service.create(req.user.id, cardSchema.parse(req.body)));
  update = async (req: AuthenticatedRequest, res: Response) => res.json(await this.service.update(req.user.id, req.params.id as string, cardPatchSchema.parse(req.body)));
  setPrimary = async (req: AuthenticatedRequest, res: Response) => res.json(await this.service.setPrimary(req.user.id, req.params.id as string));
  delete = async (req: AuthenticatedRequest, res: Response) => { await this.service.delete(req.user.id, req.params.id as string); res.status(204).end(); };
}
