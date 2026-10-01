import type { Queryable } from '../../src/types.js';

type CardWithProfile = { card_data: Record<string, unknown>; profile_data: Record<string, unknown> | null };

export class WalletRepository {
  constructor(private readonly db: Queryable) {}

  /** The user's card with their profile, which supplies the details the card does not override. */
  cardWithProfile(userId: string, cardId: string) {
    return this.db.query<CardWithProfile>(
      `SELECT c.data card_data, p.data profile_data FROM cards c
       LEFT JOIN profiles p ON p.user_id=c.user_id
       WHERE c.id=$1 AND c.user_id=$2`,
      [cardId, userId],
    ).then((result) => result.rows[0] ?? null);
  }

  readyMediaObject(userId: string, mediaId: string) {
    return this.db.query<{ object_name: string }>(
      "SELECT object_name FROM media WHERE id=$1 AND user_id=$2 AND status='ready'",
      [mediaId, userId],
    ).then((result) => result.rows[0]?.object_name ?? null);
  }
}
