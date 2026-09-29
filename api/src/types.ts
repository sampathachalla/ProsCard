import type { Request } from 'express';

export type AuthUser = { id: string; email: string };

export type AuthenticatedRequest = Request & { user: AuthUser };

export type Queryable = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<{ rows: T[]; rowCount: number | null }>;
};
