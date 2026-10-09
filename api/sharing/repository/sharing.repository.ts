import type { Queryable } from '../../src/types.js';

type Share = {
  id: string;
  user_id: string;
  card_id: string;
  slug: string;
  is_active: boolean;
  expires_at: Date | null;
  created_at: Date;
};
type PublicRow = Share & { card_data: Record<string, unknown> };
type PublicViewRow = PublicRow & { profile_data: Record<string, unknown> | null };
type MediaObject = { object_name: string };
type MediaObjectRow = { id: string; object_name: string };

export class SharingRepository {
  constructor(private readonly db: Queryable) {}

  findReusable(u: string, c: string) {
    return this.db.query<Share>(
      `SELECT * FROM shares WHERE user_id=$1 AND card_id=$2 AND is_active=true AND expires_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      [u, c],
    ).then((r) => r.rows[0] ?? null);
  }

  create(u: string, c: string, slug: string, e: Date | null) {
    return this.db.query<Share>(
      `INSERT INTO shares(user_id,card_id,slug,expires_at) SELECT $1,id,$3,$4 FROM cards WHERE id=$2 AND user_id=$1 RETURNING *`,
      [u, c, slug, e],
    ).then((r) => r.rows[0] ?? null);
  }

  public(slug: string) {
    return this.db.query<PublicRow>(
      `SELECT s.*,c.data card_data FROM shares s JOIN cards c ON c.id=s.card_id WHERE s.slug=$1 AND s.is_active=true AND (s.expires_at IS NULL OR s.expires_at>now())`,
      [slug],
    ).then((r) => r.rows[0] ?? null);
  }

  /** Active share with its card and the owner's profile; the share page renders both. */
  publicView(slug: string) {
    return this.db.query<PublicViewRow>(
      `SELECT s.*,c.data card_data,p.data profile_data FROM shares s JOIN cards c ON c.id=s.card_id LEFT JOIN profiles p ON p.user_id=s.user_id WHERE s.slug=$1 AND s.is_active=true AND (s.expires_at IS NULL OR s.expires_at>now())`,
      [slug],
    ).then((r) => r.rows[0] ?? null);
  }

  readyMedia(u: string, id: string) {
    return this.db.query<MediaObject>(
      `SELECT object_name FROM media WHERE id=$1 AND user_id=$2 AND status='ready'`,
      [id, u],
    ).then((r) => r.rows[0] ?? null);
  }

  /** Batch lookup for share-page image signing (cover + photo + logo in one query). */
  readyMediaMany(u: string, ids: string[]) {
    if (!ids.length) return Promise.resolve([] as MediaObjectRow[]);
    return this.db.query<MediaObjectRow>(
      `SELECT id::text AS id, object_name FROM media WHERE user_id=$1 AND status='ready' AND id = ANY($2::uuid[])`,
      [u, ids],
    ).then((r) => r.rows);
  }

  revoke(u: string, id: string) {
    return this.db.query('UPDATE shares SET is_active=false WHERE id=$1 AND user_id=$2', [id, u]).then((r) => (r.rowCount ?? 0) > 0);
  }
}
