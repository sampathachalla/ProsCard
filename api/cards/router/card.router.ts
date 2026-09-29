import { Router, type RequestHandler } from 'express';
import { asyncHandler } from '../../src/async-handler.js';
import type { CardController } from '../controller/card.controller.js';
export function createCardRouter(auth: RequestHandler, controller: CardController): Router {
  const router=Router(); router.use(auth);
  router.get('/',asyncHandler(controller.list)); router.post('/',asyncHandler(controller.create));
  router.get('/:id',asyncHandler(controller.get)); router.put('/:id',asyncHandler(controller.update)); router.delete('/:id',asyncHandler(controller.delete));
  return router;
}
