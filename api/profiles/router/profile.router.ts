import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { ProfileController } from '../controller/profile.controller.js';

export function createProfileRouter(authenticate: RequestHandler, controller: ProfileController): Router {
  const router = Router();
  router.use(authenticate);
  router.get('/me', asyncHandler(controller.getMine));
  router.put('/me', asyncHandler(controller.saveMine));
  return router;
}
