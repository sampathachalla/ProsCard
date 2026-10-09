import type { SupabaseClient } from '@supabase/supabase-js';
import request from 'supertest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { loadConfig } from '../../src/config.js';
import { createPool } from '../../src/database.js';
import type { ObjectStorageGateway } from '../../media/services/oci-storage.service.js';

const userId='11111111-1111-4111-8111-111111111111';
const deletedAuthUsers:string[]=[];
const fakeUser={id:userId,email:'test@proscard.dev',app_metadata:{},user_metadata:{},aud:'authenticated',created_at:new Date().toISOString()};
const fakeSession={access_token:'test-token',refresh_token:'refresh-token',expires_in:3600,token_type:'bearer',user:fakeUser};
const supabase={auth:{
  getUser:async(token:string)=>token==='test-token'?{data:{user:fakeUser},error:null}:{data:{user:null},error:{message:'invalid'}},
  signUp:async()=>({data:{user:fakeUser,session:fakeSession},error:null}),
  signInWithPassword:async()=>({data:{user:fakeUser,session:fakeSession},error:null}),
  signInWithOAuth:async()=>({data:{provider:'google',url:'https://supabase.test/auth/v1/authorize?provider=google'},error:null}),
  resetPasswordForEmail:async()=>({data:{},error:null}),
  refreshSession:async()=>({data:{user:fakeUser,session:fakeSession},error:null}),
  admin:{signOut:async()=>({data:{},error:null}),updateUserById:async()=>({data:{user:fakeUser},error:null}),deleteUser:async()=>{deletedAuthUsers.push(userId);return{data:{user:fakeUser},error:null}}},
}} as unknown as SupabaseClient;

const deletedObjects:string[]=[];
let failObjectDeletion=false;
const storage:ObjectStorageGateway={
  createUploadUrl:async name=>({url:`https://oci.test/upload/${name}`,expiresAt:new Date('2030-01-01')}),
  createDownloadUrl:async name=>({url:`https://oci.test/download/${name}`,expiresAt:new Date('2030-01-01')}),
  objectExists:async()=>true,
  deleteObject:async name=>{if(failObjectDeletion)throw new Error('simulated OCI deletion failure');deletedObjects.push(name)},
};

const config=loadConfig();
const pool=createPool(config);
const cardReader={read:async()=>({isBusinessCard:true,cardBounds:{x:0.1,y:0.1,width:0.8,height:0.5},rotation:0 as const,contact:{name:'Grace Hopper',title:'Rear Admiral',company:'US Navy',phone:'',email:'grace@navy.mil',website:'',address:'',notes:''}})};
const app=createApp({db:pool,supabase,storage,cardReader});
const auth={Authorization:'Bearer test-token'};
let cardId='';let shareId='';let shareSlug='';let contactId='';let mediaId='';

const card={category:'Professional',name:'Ada Lovelace',title:'Engineer',company:'Analytical Engines',phone:'',email:'ada@example.com',gradient:['#000000','#ffffff'],sectionLayouts:{identity:'classic',professional:'classic',bio:'classic',connections:'classic'},sectionThemes:{identity:{},professional:{},bio:{},connections:{}},sectionOverrides:{},connectionFields:[],connectionFieldsCustomized:false,cardTheme:{id:'custom'}};

beforeAll(async()=>{
  for(let attempt=0;attempt<20;attempt++){try{await pool.query('SELECT 1');break}catch(error){if(attempt===19)throw error;await new Promise(r=>setTimeout(r,250));}}
  // Only touch the fake test user's rows: this suite runs against the local development database.
  for(const table of ['media','shares','contacts','cards','onboarding','profiles'])await pool.query(`DELETE FROM ${table} WHERE user_id=$1`,[userId]);
});
afterAll(async()=>{await pool.end()});

describe('ProsCard API routes',()=>{
  it('reports health',async()=>{const r=await request(app).get('/health');expect(r.status).toBe(200);expect(r.body.status).toBe('ok')});
  it('reports readiness, request IDs, and API documentation',async()=>{const ready=await request(app).get('/ready');expect(ready.status).toBe(200);expect(ready.headers['x-request-id']).toBeTruthy();expect(ready.body.database).toBe('ok');const docs=await request(app).get('/api-docs.json');expect(docs.status).toBe(200);expect(docs.body.openapi).toBe('3.1.0');expect(docs.body.paths['/cards']).toBeTruthy()});
  it('rejects protected routes without a bearer token',async()=>{expect((await request(app).get('/api/v1/profiles/me')).status).toBe(401)});
  it('rejects unapproved browser origins when configured',async()=>{const restricted=createApp({db:pool,supabase,storage,corsOrigins:['https://app.proscard.test']});expect((await request(restricted).get('/health').set('Origin','https://evil.test')).status).toBe(403)});
  it('supports signup, login, and password reset',async()=>{
    const signup=await request(app).post('/api/v1/auth/signup').send({email:'test@proscard.dev',password:'password123'});expect(signup.status).toBe(201);expect(signup.body.token).toBe('test-token');
    expect((await request(app).post('/api/v1/auth/login').send({email:'test@proscard.dev',password:'password123'})).status).toBe(200);
    const google=await request(app).post('/api/v1/auth/google').send({redirectTo:'proscard://auth/callback'});expect(google.status).toBe(200);expect(google.body.url).toContain('provider=google');
    expect((await request(app).post('/api/v1/auth/forgot-password').send({email:'test@proscard.dev'})).status).toBe(202);
    expect((await request(app).post('/api/v1/auth/refresh').send({refreshToken:'refresh-token'})).body.token).toBe('test-token');
    expect((await request(app).post('/api/v1/auth/logout').set(auth)).status).toBe(200);
    expect((await request(app).post('/api/v1/auth/reset-password').set(auth).send({password:'new-password-123'})).status).toBe(200);
    const me=await request(app).get('/api/v1/auth/me').set(auth);expect(me.status).toBe(200);expect(me.body.user.id).toBe(userId);
  });
  it('creates and reads the current profile',async()=>{
    expect((await request(app).get('/api/v1/profiles/me').set(auth)).status).toBe(404);
    const body={prefix:'',firstName:'Ada',middleName:'',lastName:'Lovelace',suffix:'',preferredName:'Ada',accreditations:'',fullName:'Ada Lovelace',title:'Engineer',department:'Research',organization:'Analytical Engines',companyLogoUrl:'',coverPhotoUrl:'',email:'ada@example.com',phone:'',photoUrl:'',website:'',social:{github:'ada'},tagline:'',businessAddress:'',shortBio:''};
    expect((await request(app).put('/api/v1/profiles/me').set(auth).send(body)).status).toBe(200);
    expect((await request(app).get('/api/v1/profiles/me').set(auth)).body.firstName).toBe('Ada');
  });
  it('saves and completes onboarding',async()=>{
    expect((await request(app).get('/api/v1/onboarding').set(auth)).body.completed).toBe(false);
    expect((await request(app).put('/api/v1/onboarding/draft').set(auth).send({step:2})).status).toBe(200);
    const done=await request(app).post('/api/v1/onboarding/complete').set(auth).send({step:5});expect(done.status).toBe(200);expect(done.body.completed).toBe(true);
  });
  it('covers card CRUD',async()=>{
    const created=await request(app).post('/api/v1/cards').set(auth).send(card);expect(created.status).toBe(201);expect(created.body.isPrimary).toBe(true);cardId=created.body.id;
    expect((await request(app).get('/api/v1/cards').set(auth)).body).toHaveLength(1);
    expect((await request(app).get(`/api/v1/cards/${cardId}`).set(auth)).body.name).toBe('Ada Lovelace');
    expect((await request(app).put(`/api/v1/cards/${cardId}`).set(auth).send({title:'Programmer'})).body.title).toBe('Programmer');
  });
  it('serves a shared card with its profile and only the images it shows',async()=>{
    const logo=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'companyLogo',scope:'card',cardId,fileName:'logo.png',contentType:'image/png'});
    await request(app).post(`/api/v1/media/${logo.body.mediaId}/confirm`).set(auth);
    const privateContact=await request(app).post('/api/v1/contacts').set(auth).send({name:'Private'});
    const unrelated=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'contactCard',scope:'contact',contactId:privateContact.body.id,fileName:'c.jpg',contentType:'image/jpeg'});
    await request(app).post(`/api/v1/media/${unrelated.body.mediaId}/confirm`).set(auth);
    const share=await request(app).post(`/api/v1/sharing/cards/${cardId}`).set(auth).send({});const slug=share.body.slug as string;
    const view=await request(app).get(`/api/v1/sharing/public/${slug}/view`);expect(view.status).toBe(200);
    expect(view.body.profile.firstName).toBe('Ada');
    // /view inlines short-lived OCI URLs so scanners load images in one hop (no per-image API redirect).
    expect(view.body.card.sectionOverrides.logo).toContain(`oci.test/download/${logo.body.objectName}`);
    expect(JSON.stringify(view.body)).not.toContain('/api/v1/media/');
    const image=await request(app).get(`/api/v1/sharing/public/${slug}/media/${logo.body.mediaId}`);expect(image.status).toBe(302);expect(image.headers.location).toContain(`oci.test/download/${logo.body.objectName}`);
    expect((await request(app).get(`/api/v1/sharing/public/${slug}/media/${unrelated.body.mediaId}`)).status).toBe(404);
    expect((await request(app).get(`/api/v1/sharing/public/${slug}/media/not-a-uuid`)).status).toBe(404);
    await request(app).delete(`/api/v1/sharing/${share.body.id}`).set(auth);
    expect((await request(app).get(`/api/v1/sharing/public/${slug}/view`)).status).toBe(404);
    expect((await request(app).get(`/api/v1/sharing/public/${slug}/media/${logo.body.mediaId}`)).status).toBe(404);
    await request(app).delete(`/api/v1/contacts/${privateContact.body.id}`).set(auth);
  });
  it('serves the public share page from the exported web app',async()=>{
    const webDir=mkdtempSync(path.join(tmpdir(),'share-web-'));writeFileSync(path.join(webDir,'index.html'),'<div id="root"></div>');
    const withWeb=createApp({db:pool,supabase,storage,shareWebDir:webDir});
    const page=await request(withWeb).get('/share/abc123');expect(page.status).toBe(200);expect(page.text).toContain('id="root"');
    expect(page.headers['content-security-policy']).toContain('https://*.oraclecloud.com');
    expect((await request(withWeb).get('/_expo/static/missing.js')).status).toBe(404);
    expect((await request(app).get('/share/abc123')).status).toBe(404);
  });
  it('creates wallet passes only for the owner\'s cards',async()=>{
    expect((await request(app).get('/api/v1/wallet/status')).body).toEqual({apple:false,google:false});
    expect((await request(app).post(`/api/v1/wallet/cards/${cardId}/apple`).set(auth)).status).toBe(503);
    const passes:{card:string;share:string;webService?:{url:string;token:string}}[]=[];
    const walletApp=createApp({db:pool,supabase,storage,wallet:{
      apple:{passTypeId:'pass.test.proscard',authToken:(serial:string)=>`tok-${serial}`,verifyAuth:(serial:string,header?:string)=>header===`ApplePass tok-${serial}`,
        create:async(card:{cardId:string},share:string,_images:unknown,webService?:{url:string;token:string})=>{passes.push({card:card.cardId,share,webService});return Buffer.from('PKPASS')}} as never,
      google:{createSaveUrl:(_card:unknown,share:string)=>`https://pay.google.com/gp/v/save/jwt?share=${encodeURIComponent(share)}`} as never,
      linkSecret:'test-secret',publicBaseUrl:'https://cards.test',
    }});
    expect((await request(walletApp).post('/api/v1/wallet/cards/00000000-0000-4000-8000-000000000000/apple').set(auth)).status).toBe(404);
    expect((await request(walletApp).post(`/api/v1/wallet/cards/${cardId}/apple`)).status).toBe(401);
    const link=await request(walletApp).post(`/api/v1/wallet/cards/${cardId}/apple`).set(auth);expect(link.status).toBe(200);
    const passPath=new URL(link.body.url).pathname;expect(link.body.url.startsWith('https://cards.test/api/v1/wallet/apple/')).toBe(true);
    const pass=await request(walletApp).get(passPath);expect(pass.status).toBe(200);expect(pass.headers['content-type']).toContain('application/vnd.apple.pkpass');
    expect(passes[0]?.card).toBe(cardId);expect(passes[0]?.share).toMatch(/^https:\/\/cards\.test\/share\/[\w-]+$/);
    const [payload,signature]=passPath.split('/').pop()!.replace(/\.pkpass$/,'').split('.');
    const forged=Buffer.from(JSON.stringify({u:userId,c:cardId,e:Math.floor(Date.now()/1000)+600})).toString('base64url');
    expect((await request(walletApp).get(`/api/v1/wallet/apple/${forged}.${signature}.pkpass`)).status).toBe(404);
    expect((await request(walletApp).get(`/api/v1/wallet/apple/${payload}.tampered.pkpass`)).status).toBe(404);
    const google=await request(walletApp).post(`/api/v1/wallet/cards/${cardId}/google`).set(auth);expect(google.status).toBe(200);expect(google.body.url).toContain('pay.google.com');
    // Apple's web service: Wallet registers the device when the pass is added, which the app reads as "added".
    expect(passes[0]?.webService).toEqual({url:'https://cards.test/api/v1/wallet/apple/ws',token:`tok-${cardId}`});
    const ws=`/api/v1/wallet/apple/ws/v1/devices/device-1/registrations/pass.test.proscard/${cardId}`;
    expect((await request(walletApp).get(`/api/v1/wallet/cards/${cardId}/status`).set(auth)).body.apple).toEqual({enabled:true,inWallet:false,addedAt:null});
    expect((await request(walletApp).post(ws).set('Authorization','ApplePass wrong').send({pushToken:'push-1'})).status).toBe(401);
    expect((await request(walletApp).post(ws.replace('pass.test.proscard','pass.other')).set('Authorization',`ApplePass tok-${cardId}`).send({pushToken:'push-1'})).status).toBe(401);
    expect((await request(walletApp).post(ws).set('Authorization',`ApplePass tok-${cardId}`).send({pushToken:'push-1'})).status).toBe(201);
    expect((await request(walletApp).post(ws).set('Authorization',`ApplePass tok-${cardId}`).send({pushToken:'push-2'})).status).toBe(200);
    const added=(await request(walletApp).get(`/api/v1/wallet/cards/${cardId}/status`).set(auth)).body.apple;expect(added.inWallet).toBe(true);expect(added.addedAt).toBeTruthy();
    expect((await request(walletApp).get(`/api/v1/wallet/apple/ws/v1/devices/device-1/registrations/pass.test.proscard`)).status).toBe(204);
    const latest=await request(walletApp).get(`/api/v1/wallet/apple/ws/v1/passes/pass.test.proscard/${cardId}`).set('Authorization',`ApplePass tok-${cardId}`);expect(latest.status).toBe(200);expect(latest.headers['content-type']).toContain('pkpass');
    expect((await request(walletApp).post('/api/v1/wallet/apple/ws/v1/log').send({logs:['test']})).status).toBe(200);
    expect((await request(walletApp).delete(ws).set('Authorization',`ApplePass tok-${cardId}`)).status).toBe(200);
    expect((await request(walletApp).get(`/api/v1/wallet/cards/${cardId}/status`).set(auth)).body.apple.inWallet).toBe(false);
  });
  it('creates, resolves, and revokes a public share',async()=>{
    const created=await request(app).post(`/api/v1/sharing/cards/${cardId}`).set(auth).send({});expect(created.status).toBe(201);shareId=created.body.id;shareSlug=created.body.slug;
    expect((await request(app).get(`/api/v1/sharing/public/${shareSlug}`)).body.name).toBe('Ada Lovelace');
    const vcf=await request(app).get(`/api/v1/sharing/public/${shareSlug}/vcard`);
    expect(vcf.status).toBe(200);
    expect(vcf.headers['content-type']).toContain('text/vcard');
    expect(vcf.text).toContain('BEGIN:VCARD');
    expect(vcf.text).toContain('FN:Ada Lovelace');
    expect((await request(app).delete(`/api/v1/sharing/${shareId}`).set(auth)).status).toBe(204);
    expect((await request(app).get(`/api/v1/sharing/public/${shareSlug}`)).status).toBe(404);
  });
  it('reads business-card photos for signed-in users only',async()=>{
    expect((await request(app).post('/api/v1/scanner/read').send({image:'aGVsbG8='})).status).toBe(401);
    expect((await request(app).post('/api/v1/scanner/read').set(auth).send({image:'not base64!'})).status).toBe(400);
    const read=await request(app).post('/api/v1/scanner/read').set(auth).send({image:'aGVsbG8=',mimeType:'image/jpeg'});expect(read.status).toBe(200);expect(read.body.contact.name).toBe('Grace Hopper');expect(read.body.cardBounds.width).toBe(0.8);
    const large=await request(app).post('/api/v1/scanner/read').set(auth).send({image:'A'.repeat(2*1024*1024)});expect(large.status).toBe(200);
    expect((await request(createApp({db:pool,supabase,storage})).post('/api/v1/scanner/read').set(auth).send({image:'aGVsbG8='})).status).toBe(503);
  });
  it('covers contact CRUD',async()=>{
    const created=await request(app).post('/api/v1/contacts').set(auth).send({name:'Grace Hopper',title:'Admiral'});expect(created.status).toBe(201);contactId=created.body.id;
    expect((await request(app).get('/api/v1/contacts').set(auth)).body).toHaveLength(1);
    expect((await request(app).get(`/api/v1/contacts/${contactId}`).set(auth)).body.name).toBe('Grace Hopper');
    expect((await request(app).put(`/api/v1/contacts/${contactId}`).set(auth).send({company:'US Navy'})).body.company).toBe('US Navy');
    expect((await request(app).delete(`/api/v1/contacts/${contactId}`).set(auth)).status).toBe(204);
  });
  it('stores scanned card photos against a contact and removes them with it',async()=>{
    const contact=await request(app).post('/api/v1/contacts').set(auth).send({name:'Katherine Johnson',website:'nasa.gov',notes:'Met at expo'});expect(contact.status).toBe(201);expect(contact.body.website).toBe('nasa.gov');
    const id=contact.body.id as string;
    const upload=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'contactCard',scope:'contact',contactId:id,fileName:'card.jpg',contentType:'image/jpeg'});expect(upload.status).toBe(201);expect(upload.body.objectName).toContain(`/contacts/${id}/contactCard/`);
    const confirmed=await request(app).post(`/api/v1/media/${upload.body.mediaId}/confirm`).set(auth);expect(confirmed.status).toBe(200);expect(confirmed.body.contactField).toBe('cardImageUrl');
    expect((await request(app).get(`/api/v1/contacts/${id}`).set(auth)).body.cardImageUrl).toBe(`/api/v1/media/${upload.body.mediaId}/content`);
    const retake=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'contactCard',scope:'contact',contactId:id,fileName:'card-2.jpg',contentType:'image/jpeg'});
    const replaced=await request(app).post(`/api/v1/media/${retake.body.mediaId}/confirm`).set(auth);expect(replaced.body.replacedMediaId).toBe(upload.body.mediaId);expect(deletedObjects).toContain(upload.body.objectName);
    expect((await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'contactCard',scope:'contact',contactId:'00000000-0000-4000-8000-000000000000',fileName:'x.jpg',contentType:'image/jpeg'})).status).toBe(404);
    expect((await request(app).delete(`/api/v1/contacts/${id}`).set(auth)).status).toBe(204);
    expect(deletedObjects).toContain(retake.body.objectName);
    expect((await pool.query('SELECT 1 FROM media WHERE id=$1',[retake.body.mediaId])).rowCount).toBe(0);
  });
  it('creates, replaces, and removes attached media safely',async()=>{
    const created=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'profilePhoto',fileName:'avatar.png',contentType:'image/png',sizeBytes:1024});expect(created.status).toBe(201);mediaId=created.body.mediaId;expect(created.body.kind).toBe('profilePhoto');expect(created.body.objectName).toContain('/profilePhoto/');expect(created.body.url).toContain('oci.test/upload');
    const confirmed=await request(app).post(`/api/v1/media/${mediaId}/confirm`).set(auth);expect(confirmed.status).toBe(200);expect(confirmed.body.profileField).toBe('photoUrl');
    expect((await request(app).get(`/api/v1/media/${mediaId}/download-url`).set(auth)).body.url).toContain('oci.test/download');
    const replacement=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'profilePhoto',fileName:'new-avatar.png',contentType:'image/png',sizeBytes:2048});expect(replacement.status).toBe(201);
    const replacementId=replacement.body.mediaId as string;const replaced=await request(app).post(`/api/v1/media/${replacementId}/confirm`).set(auth);expect(replaced.status).toBe(200);expect(replaced.body.replacedMediaId).toBe(mediaId);expect(replaced.body.cleanupPending).toBe(false);expect(deletedObjects).toContain(created.body.objectName);
    expect((await request(app).get(`/api/v1/media/${mediaId}/download-url`).set(auth)).status).toBe(404);
    expect((await request(app).get('/api/v1/profiles/me').set(auth)).body.photoUrl).toBe(`/api/v1/media/${replacementId}/content`);
    expect((await request(app).delete(`/api/v1/media/${replacementId}`).set(auth)).status).toBe(204);
    expect((await request(app).get('/api/v1/profiles/me').set(auth)).body.photoUrl).toBe('');
  });
  it('keeps replacement active when old OCI cleanup fails',async()=>{
    const original=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'coverPhoto',fileName:'old-cover.png',contentType:'image/png'});const originalId=original.body.mediaId as string;await request(app).post(`/api/v1/media/${originalId}/confirm`).set(auth);
    const replacement=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'coverPhoto',fileName:'new-cover.png',contentType:'image/png'});const replacementId=replacement.body.mediaId as string;
    failObjectDeletion=true;const confirmed=await request(app).post(`/api/v1/media/${replacementId}/confirm`).set(auth);failObjectDeletion=false;
    expect(confirmed.status).toBe(200);expect(confirmed.body.cleanupPending).toBe(true);expect(confirmed.body.replacedMediaId).toBe(originalId);
    expect((await request(app).get('/api/v1/profiles/me').set(auth)).body.coverPhotoUrl).toBe(`/api/v1/media/${replacementId}/content`);
    expect((await pool.query<{status:string}>('SELECT status FROM media WHERE id=$1',[originalId])).rows[0]?.status).toBe('cleanup_failed');
    const cleanup=await request(app).post('/api/v1/media/cleanup/retry').set(auth);expect(cleanup.status).toBe(200);expect(cleanup.body.cleaned).toBe(1);expect(cleanup.body.failed).toBe(0);
    expect((await request(app).get(`/api/v1/media/${originalId}/download-url`).set(auth)).status).toBe(404);
    expect((await request(app).get('/api/v1/profiles/me').set(auth)).body.coverPhotoUrl).toBe(`/api/v1/media/${replacementId}/content`);
    expect((await request(app).delete(`/api/v1/media/${replacementId}`).set(auth)).status).toBe(204);
  });
  it('deletes cards and validates malformed input',async()=>{
    expect((await request(app).post('/api/v1/cards').set(auth).send({name:''})).status).toBe(400);
    const upload=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'companyLogo',scope:'card',cardId,fileName:'card-logo.png',contentType:'image/png'});expect(upload.status).toBe(201);expect(upload.body.scope).toBe('card');
    const attached=await request(app).post(`/api/v1/media/${upload.body.mediaId}/confirm`).set(auth);expect(attached.status).toBe(200);expect(attached.body.cardField).toBe('logo');
    expect((await request(app).get(`/api/v1/cards/${cardId}`).set(auth)).body.sectionOverrides.logo).toBe(`/api/v1/media/${upload.body.mediaId}/content`);
    expect((await request(app).delete(`/api/v1/cards/${cardId}`).set(auth)).status).toBe(409);
    const replacement=await request(app).post('/api/v1/cards').set(auth).send({...card,name:'Replacement card'});expect(replacement.status).toBe(201);expect(replacement.body.isPrimary).toBe(false);
    const promoted=await request(app).put(`/api/v1/cards/${replacement.body.id}/primary`).set(auth);expect(promoted.status).toBe(200);expect(promoted.body.isPrimary).toBe(true);
    expect((await request(app).delete(`/api/v1/cards/${cardId}`).set(auth)).status).toBe(204);
    expect((await request(app).get(`/api/v1/cards/${cardId}`).set(auth)).status).toBe(404);
  });
  it('deletes the account with its data, stored media and Supabase identity',async()=>{
    await request(app).put('/api/v1/profiles/me').set(auth).send({firstName:'Ada'});
    const created=await request(app).post('/api/v1/cards').set(auth).send(card);expect(created.status).toBe(201);
    await request(app).post(`/api/v1/sharing/cards/${created.body.id}`).set(auth).send({});
    await request(app).post('/api/v1/contacts').set(auth).send({name:'Grace Hopper'});
    const upload=await request(app).post('/api/v1/media/upload-url').set(auth).send({kind:'profilePhoto',fileName:'me.png',contentType:'image/png',sizeBytes:10});
    const objectName=upload.body.objectName as string;
    expect((await request(app).delete('/api/v1/account').set(auth)).status).toBe(204);
    for(const table of ['media','shares','contacts','cards','onboarding','profiles']){
      expect((await pool.query(`SELECT 1 FROM ${table} WHERE user_id=$1`,[userId])).rowCount).toBe(0);
    }
    expect(deletedObjects).toContain(objectName);
    expect(deletedAuthUsers).toContain(userId);
    expect((await request(app).delete('/api/v1/account')).status).toBe(401);
  });
});
