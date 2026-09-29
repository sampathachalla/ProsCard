import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { ProfileService } from '../services/profile.service.js';
import { profileSchema } from '../utils/profile.schemas.js';

export class ProfileController {
  constructor(private readonly service: ProfileService) {}
  getMine = async (request: AuthenticatedRequest, response: Response) => {
    const profile = await this.service.get(request.user.id);
    response.status(profile ? 200 : 404).json(profile ?? { message: 'Profile not found.' });
  };
  saveMine = async (request: AuthenticatedRequest, response: Response) => {
    const profile = profileSchema.parse(request.body);
    response.json(await this.service.save(request.user.id, profile));
  };
}
