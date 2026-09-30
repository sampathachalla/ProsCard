import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { ScannerController } from '../controller/scanner.controller.js';

export function createScannerRouter(authenticate: RequestHandler, limiter: RequestHandler, controller: ScannerController) {
  const router = Router();
  router.use(authenticate);
  router.post('/read', limiter, asyncHandler(controller.read));
  return router;
}
