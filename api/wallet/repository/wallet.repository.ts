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

  cardOwner(cardId: string) {
    return this.db.query<{ user_id: string }>('SELECT user_id FROM cards WHERE id::text=$1', [cardId])
      .then((result) => result.rows[0]?.user_id ?? null);
  }

  /** Returns true when this device had not registered the pass before. */
  register(deviceId: string, passTypeId: string, serial: string, pushToken: string) {
    return this.db.query(
      `INSERT INTO wallet_registrations(device_library_id,pass_type_id,serial_number,push_token)
       VALUES($1,$2,$3,$4) ON CONFLICT (device_library_id,pass_type_id,serial_number) DO UPDATE SET push_token=EXCLUDED.push_token
       RETURNING (xmax = 0) AS inserted`,
      [deviceId, passTypeId, serial, pushToken],
    ).then((result) => Boolean((result.rows[0] as { inserted?: boolean } | undefined)?.inserted));
  }

  unregister(deviceId: string, passTypeId: string, serial: string) {
    return this.db.query('DELETE FROM wallet_registrations WHERE device_library_id=$1 AND pass_type_id=$2 AND serial_number=$3', [deviceId, passTypeId, serial]);
  }

  /** Whether any device currently has the card's pass, and when it was most recently added. */
  registrations(passTypeId: string, serial: string) {
    return this.db.query<{ devices: string; added_at: Date | null }>(
      'SELECT count(*) devices, max(created_at) added_at FROM wallet_registrations WHERE pass_type_id=$1 AND serial_number=$2',
      [passTypeId, serial],
    ).then((result) => ({ devices: Number(result.rows[0]?.devices ?? 0), addedAt: result.rows[0]?.added_at ?? null }));
  }

  readyMediaObject(userId: string, mediaId: string) {
    return this.db.query<{ object_name: string }>(
      "SELECT object_name FROM media WHERE id=$1 AND user_id=$2 AND status='ready'",
      [mediaId, userId],
    ).then((result) => result.rows[0]?.object_name ?? null);
  }
}
