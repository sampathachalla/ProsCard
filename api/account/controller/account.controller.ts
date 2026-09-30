import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { AccountService } from '../services/account.service.js';

export class AccountController {
  constructor(private readonly service: AccountService) {}
  delete = async (request: AuthenticatedRequest, response: Response) => {
    await this.service.delete(request.user.id);
    response.status(204).end();
  };
}
