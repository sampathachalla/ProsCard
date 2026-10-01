import type { Request, Response } from 'express';
import { log } from '../../src/logger.js';
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

  cardStatus = async (request: AuthenticatedRequest, response: Response) =>
    response.json(await this.service.cardStatus(request.user.id, request.params.cardId as string));

  // ---- Apple pass web service: https://developer.apple.com/documentation/walletpasses/adding-a-web-service-to-update-passes ----
  registerDevice = async (request: Request, response: Response) => {
    const created = await this.service.registerDevice(
      request.params.device as string, request.params.passType as string, request.params.serial as string,
      request.get('authorization'), (request.body as { pushToken?: unknown } | undefined)?.pushToken,
    );
    response.status(created ? 201 : 200).end();
  };

  unregisterDevice = async (request: Request, response: Response) => {
    await this.service.unregisterDevice(request.params.device as string, request.params.passType as string, request.params.serial as string, request.get('authorization'));
    response.status(200).end();
  };

  /** Pass updates are not pushed yet, so there is never anything new to report. */
  updatedPasses = async (_request: Request, response: Response) => response.status(204).end();

  latestPass = async (request: Request, response: Response) => {
    const { buffer } = await this.service.latestApplePass(
      request.params.passType as string, request.params.serial as string, request.get('authorization'), this.service.baseUrl(requestBase(request)),
    );
    response.set({ 'Content-Type': 'application/vnd.apple.pkpass', 'Last-Modified': new Date().toUTCString() });
    response.send(buffer);
  };

  passLog = async (request: Request, response: Response) => {
    const logs = (request.body as { logs?: unknown[] } | undefined)?.logs;
    if (Array.isArray(logs)) logs.slice(0, 20).forEach((message) => log('warn', 'apple_wallet_log', { message: String(message).slice(0, 500) }));
    response.status(200).end();
  };

  googleLink = async (request: AuthenticatedRequest, response: Response) =>
    response.json(await this.service.googleLink(request.user.id, request.params.cardId as string, this.service.baseUrl(requestBase(request))));
}
