import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { loadConfig } from '../../src/config.js';
import { createPool } from '../../src/database.js';

const config=loadConfig();const api=process.env.LIVE_API_URL??'http://127.0.0.1:8050';const pool=createPool(config);
const admin=createClient(config.SUPABASE_URL,config.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const email=`proscard-card-media-${randomUUID()}@example.com`;const password=randomBytes(24).toString('base64url');
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
let userId='',cardId='',mediaId='',token='';
const card={category:'Professional',name:'Media Card',title:'Engineer',company:'ProsCard',phone:'',email:'live@example.com',gradient:['#2563eb','#00a8e8'],sectionLayouts:{identity:'classic',professional:'classic',bio:'classic',connections:'classic'},sectionThemes:{identity:{},professional:{},bio:{},connections:{}},sectionOverrides:{},connectionFields:[],connectionFieldsCustomized:false,cardTheme:{id:'ocean'}};
async function json(response:Response){const body=await response.json().catch(()=>({})) as Record<string,unknown>;if(!response.ok)throw new Error(`${response.status} ${String(body.message??response.statusText)}`);return body;}
try{
  const signup=await json(await fetch(`${api}/api/v1/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));userId=String((signup.user as Record<string,unknown>)?.id??'');
  if(signup.emailConfirmationRequired){const{error}=await admin.auth.admin.updateUserById(userId,{email_confirm:true});if(error)throw error;}
  const login=await json(await fetch(`${api}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));token=String(login.token);
  const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  const created=await json(await fetch(`${api}/api/v1/cards`,{method:'POST',headers,body:JSON.stringify(card)}));cardId=String(created.id);
  const upload=await json(await fetch(`${api}/api/v1/media/upload-url`,{method:'POST',headers,body:JSON.stringify({kind:'companyLogo',scope:'card',cardId,fileName:'logo.png',contentType:'image/png',sizeBytes:image.length})}));mediaId=String(upload.mediaId);
  const put=await fetch(String(upload.url),{method:'PUT',headers:{'Content-Type':'image/png'},body:image});if(!put.ok)throw new Error(`OCI upload failed: ${put.status}`);
  const confirmed=await json(await fetch(`${api}/api/v1/media/${mediaId}/confirm`,{method:'POST',headers:{Authorization:`Bearer ${token}`}}));if(confirmed.cardField!=='logo')throw new Error('Card logo was not attached.');
  const stored=await json(await fetch(`${api}/api/v1/cards/${cardId}`,{headers:{Authorization:`Bearer ${token}`}}));if((stored.sectionOverrides as Record<string,unknown>)?.logo!==`/api/v1/media/${mediaId}/content`)throw new Error('Card reference is missing.');
  const removed=await fetch(`${api}/api/v1/cards/${cardId}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});if(removed.status!==204)throw new Error('Card deletion failed.');cardId='';mediaId='';
  const remaining=await pool.query('SELECT 1 FROM media WHERE user_id=$1',[userId]);if(remaining.rowCount)throw new Error('Card media row remains after deletion.');
  console.log('Live card-scoped OCI media passed:',{uploaded:true,attached:true,cardDeleted:true,objectCleaned:true});
}finally{
  if(userId){await pool.query('DELETE FROM media WHERE user_id=$1',[userId]);await pool.query('DELETE FROM cards WHERE user_id=$1',[userId]);const{error}=await admin.auth.admin.deleteUser(userId);if(error)throw error;}await pool.end();
}
