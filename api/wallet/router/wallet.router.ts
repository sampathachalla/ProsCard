import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { WalletController } from '../controller/wallet.controller.js';

export function createWalletRouter(authenticate: RequestHandler, limiter: RequestHandler, controller: WalletController) {
  const router = Router();
  router.get('/status', asyncHandler(controller.status));
  // Opened in Safari without the login token; the signed, 5-minute token in the path authorises it.
  router.get('/apple/:token', limiter, asyncHandler(controller.applePass));
  router.post('/cards/:cardId/apple', authenticate, limiter, asyncHandler(controller.appleLink));
  router.post('/cards/:cardId/google', authenticate, limiter, asyncHandler(controller.googleLink));
  return router;
}
