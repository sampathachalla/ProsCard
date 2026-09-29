// Opt-in test: writes and deletes one classified OCI object and temporary database/auth records.
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { loadConfig } from '../../src/config.js';
import { createPool } from '../../src/database.js';

const config=loadConfig();
const apiUrl=process.env.LIVE_API_URL??'http://127.0.0.1:8050';
const kind=z.enum(['profilePhoto','coverPhoto','companyLogo']).parse(process.argv[2]);
const pool=createPool(config);
const admin=createClient(config.SUPABASE_URL,config.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const email=`proscard-${kind}-${randomUUID()}@example.com`;
const password=randomBytes(24).toString('base64url');
const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
let userId:string|undefined;let mediaId:string|undefined;let token:string|undefined;

async function json(response:Response){const body=await response.json().catch(()=>({})) as Record<string,unknown>;if(!response.ok)throw new Error(`${response.status} ${String(body.message??response.statusText)}`);return body;}

try{
  const signup=await json(await fetch(`${apiUrl}/api/v1/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));
  userId=String((signup.user as Record<string,unknown>)?.id??'');if(!userId)throw new Error('Signup returned no user ID.');
  if(signup.emailConfirmationRequired){const{error}=await admin.auth.admin.updateUserById(userId,{email_confirm:true});if(error)throw error;}
  const login=await json(await fetch(`${apiUrl}/api/v1/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}));
  token=String(login.token??'');if(!token)throw new Error('Login returned no token.');
  const authorization={Authorization:`Bearer ${token}`};
  const upload=await json(await fetch(`${apiUrl}/api/v1/media/upload-url`,{method:'POST',headers:{...authorization,'Content-Type':'application/json'},body:JSON.stringify({kind,fileName:`live-${kind}.png`,contentType:'image/png',sizeBytes:image.length})}));
  mediaId=String(upload.mediaId??'');if(!mediaId||typeof upload.url!=='string')throw new Error('Upload URL response is incomplete.');
  const put=await fetch(upload.url,{method:'PUT',headers:{'Content-Type':'image/png'},body:image});if(!put.ok)throw new Error(`OCI upload failed with ${put.status}.`);
  const confirmed=await json(await fetch(`${apiUrl}/api/v1/media/${mediaId}/confirm`,{method:'POST',headers:authorization}));if(confirmed.status!=='ready')throw new Error('Media confirmation did not mark the object ready.');
  const profile=await json(await fetch(`${apiUrl}/api/v1/profiles/me`,{headers:authorization}));const expectedField={profilePhoto:'photoUrl',coverPhoto:'coverPhotoUrl',companyLogo:'companyLogoUrl'}[kind];if(profile[expectedField]!==`/api/v1/media/${mediaId}/content`)throw new Error('Confirmed media was not attached to the expected profile field.');
  const download=await json(await fetch(`${apiUrl}/api/v1/media/${mediaId}/download-url`,{headers:authorization}));
  if(typeof download.url!=='string')throw new Error('Download URL response is incomplete.');
  const fetched=await fetch(download.url);if(!fetched.ok)throw new Error(`OCI download failed with ${fetched.status}.`);
  const downloaded=Buffer.from(await fetched.arrayBuffer());if(!downloaded.equals(image))throw new Error('Downloaded OCI bytes do not match the uploaded profile photo.');
  const removed=await fetch(`${apiUrl}/api/v1/media/${mediaId}`,{method:'DELETE',headers:authorization});if(removed.status!==204)throw new Error(`Media deletion failed with ${removed.status}.`);mediaId=undefined;
  console.log(`Live OCI ${kind} storage passed:`,{signedUpload:true,objectUploaded:true,confirmed:true,profileAttached:true,signedDownload:true,bytesMatched:true,objectDeleted:true});
}finally{
  if(mediaId&&userId){const row=await pool.query<{object_name:string}>('DELETE FROM media WHERE id=$1 AND user_id=$2 RETURNING object_name',[mediaId,userId]);if(row.rows[0])console.error('Cleanup warning: OCI object may still exist:',row.rows[0].object_name);}
  if(userId){await pool.query('DELETE FROM media WHERE user_id=$1',[userId]);await pool.query('DELETE FROM profiles WHERE user_id=$1',[userId]);const{error}=await admin.auth.admin.deleteUser(userId);if(error)throw error;}
  await pool.end();
}
