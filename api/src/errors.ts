import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { RequestWithId } from './request-logger.js';
import { log } from './logger.js';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

/** Postgres errors caused by the request's input rather than a server fault. */
const POSTGRES_CLIENT_ERRORS: Record<string, { status: number; message: string }> = {
  '22P02': { status: 400, message: 'One of the identifiers or values is not valid.' }, // invalid_text_representation (e.g. bad UUID)
  '22001': { status: 400, message: 'One of the values is too long.' }, // string_data_right_truncation
  '23505': { status: 409, message: 'This item already exists.' }, // unique_violation
  '23503': { status: 409, message: 'This item refers to something that no longer exists.' }, // foreign_key_violation
};

function errorStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown; statusCode?: unknown } | null)?.status ?? (error as { statusCode?: unknown } | null)?.statusCode;
  return typeof status === 'number' && status >= 400 && status < 500 ? status : undefined;
}

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  const requestId=(request as typeof request&RequestWithId).requestId;
  // A response that already started streaming cannot be replaced; let Express close the connection.
  if (response.headersSent) {
    log('error','error_after_response_started',{requestId,message:error instanceof Error?error.message:String(error)});
    next(error);
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({ message: 'Validation failed.', details: error.flatten(), requestId });
    return;
  }
  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message, details: error.details, requestId });
    return;
  }
  // body-parser and similar middleware tag their errors with a client status.
  const type = (error as { type?: unknown } | null)?.type;
  if (type === 'entity.parse.failed') {
    response.status(400).json({ message: 'The request body is not valid JSON.', requestId });
    return;
  }
  if (type === 'entity.too.large') {
    response.status(413).json({ message: 'The request body is too large.', requestId });
    return;
  }
  const pgCode = (error as { code?: unknown } | null)?.code;
  const pgError = typeof pgCode === 'string' ? POSTGRES_CLIENT_ERRORS[pgCode] : undefined;
  if (pgError) {
    response.status(pgError.status).json({ message: pgError.message, requestId });
    return;
  }
  const clientStatus = errorStatus(error);
  if (clientStatus) {
    response.status(clientStatus).json({ message: error instanceof Error && error.message ? error.message : 'The request could not be processed.', requestId });
    return;
  }
  log('error','unhandled_error',{requestId,message:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined});
  response.status(500).json({ message: 'Internal server error.', requestId });
};
