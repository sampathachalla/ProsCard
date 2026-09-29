// Opt-in test: replaces and removes a real OCI profile photo, then cleans up all records.
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { loadConfig } from '../../src/config.js';
import { createPool } from '../../src/database.js';

const config=loadConfig();const api=process.env.LIVE_API_URL??'http://127.0.0.1:8050';const pool=createPool(config);
const admin=createClient(config.SUPABASE_URL,config.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const email=`proscard-replace-${randomUUID()}@example.com`;const password=randomBytes(24).toString('base64url');
const first=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
const second=Buffer.concat([first,Buffer.from('replacement')]);let userId='';let token='';const mediaIds:string[]=[];
async function json(r:Response){const b=await r.json().catch(()=>({})) as Record<string,unknown>;if(!r.ok)throw new Error(`${r.status} ${String(b.message??r.statusText)}`);return b;}
async function upload(name:string,bytes:Buffer){const auth={Authorization:`Bearer ${token}`};const signed=await json(await fetch(`${api}/api/v1/media/upload-url`,{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({kind:'profilePhoto',fileName:name,contentType:'image/png',sizeBytes:bytes.length})}));const id=String(signed.mediaId);mediaIds.push(id);const put=await fetch(String(signed.url),{method:'PUT',headers:{'Content-Type':'image/png'},body:new Uint8Array(bytes)});if(!put.ok)throw new Error(`OCI PUT failed: ${put.status}`);const confirmed=await json(await fetch(`${api}/api/v1/media/${id}/confirm`,{method:'POST',headers:auth}));const download=await json(await fetch(`${api}/api/v1/media/${id}/download-url`,{headers:auth}));return{id,confirmed,downloadUrl:String(download.url)};}
try{
  const signup=await json(await fetch(`${api}/api/v1/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));userId=String((signup.user as Record<string,unknown>)?.id??'');if(!userId)throw new Error('No user ID.');if(signup.emailConfirmationRequired){const{error}=await admin.auth.admin.updateUserById(userId,{email_confirm:true});if(error)throw error;}
  const login=await json(await fetch(`${api}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));token=String(login.token??'');if(!token)throw new Error('No access token.');
  const original=await upload('original.png',first);const replacement=await upload('replacement.png',second);
  if(replacement.confirmed.replacedMediaId!==original.id||replacement.confirmed.cleanupPending!==false)throw new Error('Replacement did not cleanly supersede the original.');
  const oldObject=await fetch(original.downloadUrl);if(oldObject.status!==404)throw new Error(`Old OCI object still resolves with ${oldObject.status}.`);
  const auth={Authorization:`Bearer ${token}`};const profile=await json(await fetch(`${api}/api/v1/profiles/me`,{headers:auth}));if(profile.photoUrl!==`/api/v1/media/${replacement.id}/content`)throw new Error('Profile does not reference the replacement.');
  const removed=await fetch(`${api}/api/v1/media/${replacement.id}`,{method:'DELETE',headers:auth});if(removed.status!==204)throw new Error(`Removal failed: ${removed.status}`);
  const cleared=await json(await fetch(`${api}/api/v1/profiles/me`,{headers:auth}));if(cleared.photoUrl!=='')throw new Error('Profile photo reference was not cleared.');
  const remaining=await pool.query('SELECT id FROM media WHERE user_id=$1',[userId]);if(remaining.rowCount!==0)throw new Error('Media rows remain after replacement/removal.');
  console.log('Live media replacement/removal passed:',{newAttachedBeforeOldDeleted:true,oldObjectDeleted:true,oldRowDeleted:true,currentObjectDeleted:true,profileReferenceCleared:true});
}finally{if(userId){await pool.query('DELETE FROM media WHERE user_id=$1',[userId]);await pool.query('DELETE FROM profiles WHERE user_id=$1',[userId]);const{error}=await admin.auth.admin.deleteUser(userId);if(error)throw error;}await pool.end();}
