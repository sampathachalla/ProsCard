import { randomBytes, randomUUID } from 'node:crypto';import{createClient}from'@supabase/supabase-js';import{loadConfig}from'../../src/config.js';import{createPool}from'../../src/database.js';
const c=loadConfig(),api=process.env.LIVE_API_URL??'http://127.0.0.1:8050',pool=createPool(c),admin=createClient(c.SUPABASE_URL,c.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});const users:{id:string;token:string}[]=[];
const card={category:'Professional',name:'Ada Lovelace',title:'Engineer',company:'ProsCard',phone:'+1 555 010 1234',email:'ada@example.com',gradient:['#2563eb','#00a8e8'],sectionLayouts:{},sectionThemes:{},sectionOverrides:{},connectionFields:[],connectionFieldsCustomized:false,cardTheme:{id:'ocean'}};
async function json(r:Response){const b=await r.json().catch(()=>({})) as Record<string,unknown>;if(!r.ok)throw new Error(`${r.status} ${String(b.message??r.statusText)}`);return b;}
async function user(){const email=`proscard-share-${randomUUID()}@example.com`,password=randomBytes(24).toString('base64url');const s=await json(await fetch(`${api}/api/v1/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));const id=String((s.user as Record<string,unknown>).id);users.push({id,token:''});if(s.emailConfirmationRequired){const{error}=await admin.auth.admin.updateUserById(id,{email_confirm:true});if(error)throw error;}const l=await json(await fetch(`${api}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));const u=users[users.length-1]!;u.token=String(l.token);return u;}
const h=(t:string)=>({Authorization:`Bearer ${t}`,'Content-Type':'application/json'});
try{
  const owner=await user(),scanner=await user();
  const created=await json(await fetch(`${api}/api/v1/cards`,{method:'POST',headers:h(owner.token),body:JSON.stringify(card)}));const cardId=String(created.id);
  // QR modal: requesting the share link twice must return the same slug so the QR code stays stable.
  const first=await json(await fetch(`${api}/api/v1/sharing/cards/${cardId}`,{method:'POST',headers:h(owner.token),body:'{}'}));
  const second=await json(await fetch(`${api}/api/v1/sharing/cards/${cardId}`,{method:'POST',headers:h(owner.token),body:'{}'}));
  if(!first.slug||first.slug!==second.slug)throw new Error('Share link is not reused.');
  // Another user cannot create a share for a card they do not own.
  const foreign=await fetch(`${api}/api/v1/sharing/cards/${cardId}`,{method:'POST',headers:h(scanner.token),body:'{}'});if(foreign.status!==404)throw new Error(`Foreign share returned ${foreign.status}.`);
  // Scanner: the public lookup works without authentication.
  const shared=await json(await fetch(`${api}/api/v1/sharing/public/${String(first.slug)}`));if(shared.id!==cardId||shared.name!==card.name)throw new Error('Public card mismatch.');
  // Scanner: save the contact twice (re-scan) — must upsert, not fail or duplicate.
  const contact={name:shared.name,title:shared.title,company:shared.company,phone:shared.phone,email:shared.email,initials:'AL',color:'#2563eb',sourceCardId:shared.id};
  const saved=await json(await fetch(`${api}/api/v1/contacts`,{method:'POST',headers:h(scanner.token),body:JSON.stringify(contact)}));
  const again=await json(await fetch(`${api}/api/v1/contacts`,{method:'POST',headers:h(scanner.token),body:JSON.stringify({...contact,title:'Principal Engineer'})}));
  if(saved.id!==again.id||again.title!=='Principal Engineer'||again.sourceCardId!==cardId)throw new Error('Re-scan did not update the existing contact.');
  const list=await fetch(`${api}/api/v1/contacts`,{headers:h(scanner.token)}).then(r=>r.json()) as Record<string,unknown>[];if(list.length!==1)throw new Error(`Expected 1 contact, got ${list.length}.`);
  const ownerList=await fetch(`${api}/api/v1/contacts`,{headers:h(owner.token)}).then(r=>r.json()) as unknown[];if(ownerList.length!==0)throw new Error('Contacts leaked across users.');
  // Contacts screen: long-press delete.
  const removed=await fetch(`${api}/api/v1/contacts/${String(saved.id)}`,{method:'DELETE',headers:h(scanner.token)});if(removed.status!==204)throw new Error('Contact delete failed.');
  console.log('Live contacts and sharing passed:',{shareLinkReused:true,foreignShareBlocked:true,publicLookup:true,rescanUpserts:true,contactsIsolated:true,contactDeleted:true});
}finally{for(const u of users){await pool.query('DELETE FROM contacts WHERE user_id=$1',[u.id]);await pool.query('DELETE FROM shares WHERE user_id=$1',[u.id]);await pool.query('DELETE FROM cards WHERE user_id=$1',[u.id]);const{error}=await admin.auth.admin.deleteUser(u.id);if(error)throw error;}await pool.end();}
