import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { AuthController } from '../controller/auth.controller.js';

export function createAuthRouter(controller: AuthController,authenticate:RequestHandler): Router {
  const router = Router();
  router.post('/signup', asyncHandler(controller.signup));
  router.post('/login', asyncHandler(controller.login));
  router.post('/forgot-password', asyncHandler(controller.forgotPassword));
  router.post('/refresh', asyncHandler(controller.refresh));
  router.post('/logout', asyncHandler(controller.logout));
  router.post('/reset-password',authenticate,asyncHandler(controller.updatePassword));
  return router;
}
