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
  '40001': { status: 503, message: 'The database is busy. Please try again.' }, // serialization_failure
  '40P01': { status: 503, message: 'The database is busy. Please try again.' }, // deadlock_detected
};

/** Postgres / driver conditions that mean the dependency is down, not a bad request. */
const POSTGRES_UNAVAILABLE: Record<string, string> = {
  '08000': 'The database is temporarily unavailable.',
  '08001': 'The database is temporarily unavailable.',
  '08003': 'The database is temporarily unavailable.',
  '08006': 'The database is temporarily unavailable.',
  '57P01': 'The database is temporarily unavailable.',
  '57P03': 'The database is temporarily unavailable.',
  '53300': 'The database is temporarily unavailable.',
};

const NETWORK_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
  'EHOSTUNREACH',
  'ENETUNREACH',
]);

function errorStatus(error: unknown): number | undefined {
  const status = (error as { status?: unknown; statusCode?: unknown } | null)?.status
    ?? (error as { statusCode?: unknown } | null)?.statusCode;
  return typeof status === 'number' && status >= 400 && status < 500 ? status : undefined;
}

function errorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : undefined;
}

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  const requestId = (request as typeof request & RequestWithId).requestId;
  // A response that already started streaming cannot be replaced; end the socket instead of hanging.
  if (response.headersSent) {
    log('error', 'error_after_response_started', {
      requestId,
      message: error instanceof Error ? error.message : String(error),
    });
    if (!response.writableEnded) {
      response.destroy(error instanceof Error ? error : undefined);
    }
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

  const code = errorCode(error);
  const pgClient = code ? POSTGRES_CLIENT_ERRORS[code] : undefined;
  if (pgClient) {
    response.status(pgClient.status).json({ message: pgClient.message, requestId });
    return;
  }
  const pgUnavailable = code ? POSTGRES_UNAVAILABLE[code] : undefined;
  if (pgUnavailable) {
    log('error', 'database_unavailable', { requestId, code, message: error instanceof Error ? error.message : String(error) });
    response.status(503).json({ message: pgUnavailable, requestId });
    return;
  }
  if (code && NETWORK_ERROR_CODES.has(code)) {
    log('error', 'dependency_network_error', { requestId, code, message: error instanceof Error ? error.message : String(error) });
    response.status(503).json({ message: 'A dependent service is temporarily unavailable.', requestId });
    return;
  }

  // SDKs (OCI, etc.) sometimes attach a 4xx statusCode — keep the status but never leak vendor text.
  const clientStatus = errorStatus(error);
  if (clientStatus) {
    log('warn', 'client_status_error', {
      requestId,
      status: clientStatus,
      message: error instanceof Error ? error.message : String(error),
    });
    response.status(clientStatus).json({ message: 'The request could not be processed.', requestId });
    return;
  }

  log('error', 'unhandled_error', {
    requestId,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  response.status(500).json({ message: 'Internal server error.', requestId });
};
