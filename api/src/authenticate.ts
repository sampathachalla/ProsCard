import type { RequestHandler } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from './errors.js';
import type { AuthenticatedRequest } from './types.js';

export function createAuthenticator(supabase:SupabaseClient):RequestHandler{
  return async(request,_response,next)=>{
    try{
      const header=request.header('authorization');
      const token=header?.match(/^Bearer\s+(.+)$/i)?.[1];
      if(!token)throw new HttpError(401,'A bearer token is required.');
      const{data,error}=await supabase.auth.getUser(token);
      if(error||!data.user)throw new HttpError(401,'The bearer token is invalid or expired.');
      (request as AuthenticatedRequest).user={id:data.user.id,email:data.user.email??''};
      next();
    }catch(error){next(error)}
  };
}
