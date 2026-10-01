import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { WalletController } from '../controller/wallet.controller.js';

export function createWalletRouter(authenticate: RequestHandler, limiter: RequestHandler, controller: WalletController) {
  const router = Router();
  router.get('/status', asyncHandler(controller.status));
  // Apple's pass web service, called by Wallet on the iPhone (authorised by each pass's own token).
  router.post('/apple/ws/v1/devices/:device/registrations/:passType/:serial', limiter, asyncHandler(controller.registerDevice));
  router.delete('/apple/ws/v1/devices/:device/registrations/:passType/:serial', limiter, asyncHandler(controller.unregisterDevice));
  router.get('/apple/ws/v1/devices/:device/registrations/:passType', limiter, asyncHandler(controller.updatedPasses));
  router.get('/apple/ws/v1/passes/:passType/:serial', limiter, asyncHandler(controller.latestPass));
  router.post('/apple/ws/v1/log', limiter, asyncHandler(controller.passLog));
  router.get('/cards/:cardId/status', authenticate, asyncHandler(controller.cardStatus));
  // Opened in Safari without the login token; the signed, 5-minute token in the path authorises it.
  router.get('/apple/:token', limiter, asyncHandler(controller.applePass));
  router.post('/cards/:cardId/apple', authenticate, limiter, asyncHandler(controller.appleLink));
  router.post('/cards/:cardId/google', authenticate, limiter, asyncHandler(controller.googleLink));
  return router;
}
