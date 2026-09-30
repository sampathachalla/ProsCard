import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { AccountController } from '../controller/account.controller.js';

export function createAccountRouter(authenticate: RequestHandler, controller: AccountController): Router {
  const router = Router();
  router.use(authenticate);
  router.delete('/', asyncHandler(controller.delete));
  return router;
}
