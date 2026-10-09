import type { Response } from 'express';
import { HttpError } from '../../src/errors.js';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { ProfileService } from '../services/profile.service.js';
import { profileSchema } from '../utils/profile.schemas.js';

export class ProfileController {
  constructor(private readonly service: ProfileService) {}
  getMine = async (request: AuthenticatedRequest, response: Response) => {
    const profile = await this.service.get(request.user.id);
    if (!profile) throw new HttpError(404, 'Profile not found.');
    response.json(profile);
  };
  saveMine = async (request: AuthenticatedRequest, response: Response) => {
    const profile = profileSchema.parse(request.body);
    response.json(await this.service.save(request.user.id, profile));
  };
}
