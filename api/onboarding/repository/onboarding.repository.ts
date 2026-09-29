import type { Queryable } from '../../src/types.js';
type Row={user_id:string;draft:Record<string,unknown>;completed_at:Date|null;updated_at:Date};
export class OnboardingRepository {
  constructor(private readonly db:Queryable){}
  get(userId:string){return this.db.query<Row>('SELECT * FROM onboarding WHERE user_id=$1',[userId]).then(r=>r.rows[0]??null);}
  save(userId:string,draft:Record<string,unknown>){return this.db.query<Row>(`INSERT INTO onboarding(user_id,draft) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET draft=EXCLUDED.draft,updated_at=now() RETURNING *`,[userId,draft]).then(r=>r.rows[0]!);}
  complete(userId:string,draft:Record<string,unknown>){return this.db.query<Row>(`INSERT INTO onboarding(user_id,draft,completed_at) VALUES($1,$2,now()) ON CONFLICT(user_id) DO UPDATE SET draft=EXCLUDED.draft,completed_at=now(),updated_at=now() RETURNING *`,[userId,draft]).then(r=>r.rows[0]!);}
}
