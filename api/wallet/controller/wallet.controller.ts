import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { WalletService } from '../services/wallet.service.js';

/** Address the caller reached us on (behind Caddy the original scheme arrives in X-Forwarded-Proto). */
const requestBase = (request: Request) => `${request.get('x-forwarded-proto')?.split(',')[0] ?? request.protocol}://${request.get('host')}`;

export class WalletController {
  constructor(private readonly service: WalletService) {}

  status = async (_request: Request, response: Response) => response.json(this.service.status());

  appleLink = async (request: AuthenticatedRequest, response: Response) =>
    response.json(await this.service.appleLink(request.user.id, request.params.cardId as string, this.service.baseUrl(requestBase(request))));

  applePass = async (request: Request, response: Response) => {
    const { buffer, fileName } = await this.service.applePass(request.params.token as string, this.service.baseUrl(requestBase(request)));
    response.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    });
    response.send(buffer);
  };

  googleLink = async (request: AuthenticatedRequest, response: Response) =>
    response.json(await this.service.googleLink(request.user.id, request.params.cardId as string, this.service.baseUrl(requestBase(request))));
}
