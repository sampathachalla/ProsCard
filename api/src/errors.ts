import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { RequestWithId } from './request-logger.js';
import { log } from './logger.js';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const requestId=(request as typeof request&RequestWithId).requestId;
  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Validation failed.', details: error.flatten(), requestId });
    return;
  }
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message, details: error.details, requestId });
    return;
  }
  log('error','unhandled_error',{requestId,message:error instanceof Error?error.message:String(error)});
  response.status(500).json({ message: 'Internal server error.', requestId });
};
