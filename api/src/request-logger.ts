import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { log } from './logger.js';

export type RequestWithId={requestId?:string};
export const requestLogger:RequestHandler=(request,response,next)=>{
  const requestId=request.header('x-request-id')?.slice(0,128)||randomUUID();
  (request as typeof request&RequestWithId).requestId=requestId;response.setHeader('x-request-id',requestId);
  const started=performance.now();response.on('finish',()=>log('info','http_request',{requestId,method:request.method,path:request.path,status:response.statusCode,durationMs:Math.round(performance.now()-started)}));next();
};
