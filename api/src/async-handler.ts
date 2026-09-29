import type { NextFunction, RequestHandler, Response } from 'express';

export function asyncHandler(
  handler: (request: never, response: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (request, response, next) => void handler(request as never, response, next).catch(next);
}
