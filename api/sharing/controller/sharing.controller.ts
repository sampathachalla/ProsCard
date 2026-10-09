import type{Request,Response}from'express';import type{AuthenticatedRequest}from'../../src/types.js';import type{SharingService}from'../services/sharing.service.js';import{createShareSchema}from'../utils/sharing.schemas.js';
export class SharingController{constructor(private readonly s:SharingService){}create=async(q:AuthenticatedRequest,r:Response)=>{const b=createShareSchema.parse(q.body);r.status(201).json(await this.s.create(q.user.id,q.params.cardId as string,b.expiresAt))};resolve=async(q:Request,r:Response)=>{r.set('Cache-Control','no-store');r.json(await this.s.resolve(q.params.slug as string))};
  // Short private cache: image fields already carry short-lived OCI URLs, so a brief reuse is safe.
  view=async(q:Request,r:Response)=>{r.set('Cache-Control','private, max-age=60');r.json(await this.s.view(q.params.slug as string))};
  // Fallback redirect when /view could not inline a signed URL for an image.
  media=async(q:Request,r:Response)=>{const signed=await this.s.mediaUrl(q.params.slug as string,q.params.mediaId as string);r.set('Cache-Control','private, max-age=300');r.redirect(302,signed.url)};
  vcard=async(q:Request,r:Response)=>{const{vcard,filename}=await this.s.vcard(q.params.slug as string);r.setHeader('Content-Type','text/vcard; charset=utf-8');r.setHeader('Content-Disposition',`inline; filename="${filename}"`);r.send(vcard)};
  revoke=async(q:AuthenticatedRequest,r:Response)=>{await this.s.revoke(q.user.id,q.params.id as string);r.status(204).end()};}
