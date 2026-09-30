import type { Queryable } from '../../src/types.js';

export type MediaKind = 'profilePhoto' | 'coverPhoto' | 'companyLogo';
export type MediaScope = 'profile' | 'card';
export type MediaStatus = 'pending' | 'ready' | 'cleanup_failed';
export type MediaRow = {
  id: string; user_id: string; object_name: string; kind: MediaKind;
  status: MediaStatus; content_type: string; original_name: string;
  size_bytes: number | null; created_at: Date; attachment_scope: MediaScope;
  card_id: string | null;
};

export class MediaRepository {
  constructor(private readonly db: Queryable) {}

  create(userId: string, objectName: string, kind: MediaKind, contentType: string,
    originalName: string, sizeBytes: number | undefined, scope: MediaScope, cardId?: string) {
    return this.db.query<MediaRow>(
      `INSERT INTO media(user_id,object_name,kind,content_type,original_name,size_bytes,attachment_scope,card_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, objectName, kind, contentType, originalName, sizeBytes ?? null, scope, cardId ?? null],
    ).then((result) => result.rows[0]!);
  }

  find(userId: string, id: string) {
    return this.db.query<MediaRow>('SELECT * FROM media WHERE id=$1 AND user_id=$2', [id, userId])
      .then((result) => result.rows[0] ?? null);
  }

  cardOwned(userId: string, cardId: string) {
    return this.db.query('SELECT 1 FROM cards WHERE id=$1 AND user_id=$2', [cardId, userId])
      .then((result) => (result.rowCount ?? 0) > 0);
  }

  findAttached(userId: string, scope: MediaScope, field: string, cardId?: string) {
    const contentExpression = "('/api/v1/media/' || m.id::text || '/content')";
    if (scope === 'profile') {
      return this.db.query<MediaRow>(
        `SELECT m.* FROM profiles p JOIN media m ON m.user_id=p.user_id
         WHERE p.user_id=$1 AND m.attachment_scope='profile'
           AND (p.data ->> $2::text)=${contentExpression} LIMIT 1`,
        [userId, field],
      ).then((result) => result.rows[0] ?? null);
    }
    return this.db.query<MediaRow>(
      `SELECT m.* FROM cards c JOIN media m ON m.card_id=c.id AND m.user_id=c.user_id
       WHERE c.user_id=$1 AND c.id=$2 AND m.attachment_scope='card'
         AND (c.data->'sectionOverrides'->>$3::text)=${contentExpression} LIMIT 1`,
      [userId, cardId, field],
    ).then((result) => result.rows[0] ?? null);
  }

  cleanupCandidates(userId: string) {
    return this.db.query<MediaRow>(
      "SELECT * FROM media WHERE user_id=$1 AND (status='cleanup_failed' OR (status='pending' AND created_at<now()-interval '1 hour')) ORDER BY created_at LIMIT 100",
      [userId],
    ).then((result) => result.rows);
  }
  cleanupCandidatesAll() {
    return this.db.query<MediaRow>(
      "SELECT * FROM media WHERE status='cleanup_failed' OR (status='pending' AND created_at<now()-interval '1 hour') ORDER BY created_at LIMIT 100",
    ).then((result) => result.rows);
  }
  allForUser(userId: string) {
    return this.db.query<MediaRow>('SELECT * FROM media WHERE user_id=$1', [userId]).then((result) => result.rows);
  }
  cardMedia(userId: string, cardId: string) {
    return this.db.query<MediaRow>(
      "SELECT * FROM media WHERE user_id=$1 AND card_id=$2 AND attachment_scope='card'",
      [userId, cardId],
    ).then((result) => result.rows);
  }
  ready(userId: string, id: string) {
    return this.db.query<MediaRow>("UPDATE media SET status='ready' WHERE id=$1 AND user_id=$2 RETURNING *", [id, userId])
      .then((result) => result.rows[0] ?? null);
  }
  cleanupFailed(userId: string, id: string) {
    return this.db.query("UPDATE media SET status='cleanup_failed' WHERE id=$1 AND user_id=$2", [id, userId]);
  }
  attach(row: MediaRow, field: string) {
    const value = `/api/v1/media/${row.id}/content`;
    if (row.attachment_scope === 'profile') {
      return this.db.query(
        `INSERT INTO profiles(user_id,data) VALUES($1,jsonb_build_object($2::text,$3::text))
         ON CONFLICT(user_id) DO UPDATE SET data=profiles.data || jsonb_build_object($2::text,$3::text),updated_at=now()`,
        [row.user_id, field, value],
      );
    }
    return this.db.query(
      `UPDATE cards SET data=jsonb_set(data,'{sectionOverrides}',COALESCE(data->'sectionOverrides','{}'::jsonb) || jsonb_build_object($3::text,$4::text),true),updated_at=now()
       WHERE id=$1 AND user_id=$2`,
      [row.card_id, row.user_id, field, value],
    );
  }
  detach(row: MediaRow, field: string) {
    const value = `/api/v1/media/${row.id}/content`;
    if (row.attachment_scope === 'profile') {
      return this.db.query(
        `UPDATE profiles SET data=jsonb_set(data,ARRAY[$2::text],'""'::jsonb,true),updated_at=now()
         WHERE user_id=$1 AND (data ->> $2::text)=$3`,
        [row.user_id, field, value],
      );
    }
    return this.db.query(
      `UPDATE cards SET data=jsonb_set(data,'{sectionOverrides}',COALESCE(data->'sectionOverrides','{}'::jsonb) || jsonb_build_object($3::text,''),true),updated_at=now()
       WHERE id=$1 AND user_id=$2 AND (data->'sectionOverrides'->>$3::text)=$4`,
      [row.card_id, row.user_id, field, value],
    );
  }
  clearCardId(userId: string, id: string) {
    return this.db.query('UPDATE media SET card_id=NULL WHERE id=$1 AND user_id=$2', [id, userId]);
  }
  delete(userId: string, id: string) {
    return this.db.query<MediaRow>('DELETE FROM media WHERE id=$1 AND user_id=$2 RETURNING *', [id, userId])
      .then((result) => result.rows[0] ?? null);
  }
}
