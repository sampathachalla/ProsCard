import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../../src/errors.js';

export class AuthRepository {
  constructor(private readonly supabase: SupabaseClient,private readonly resetRedirectUrl?:string) {}

  async signup(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw new HttpError(error.status ?? 400, error.message);
    if (!data.user) throw new HttpError(502, 'Supabase did not return a user.');
    return { user: data.user, session: data.session };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new HttpError(error.status ?? 401, error.message);
    return { user: data.user, session: data.session };
  }

  async requestPasswordReset(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email,this.resetRedirectUrl?{redirectTo:this.resetRedirectUrl}:undefined);
    if (error) throw new HttpError(error.status ?? 400, error.message);
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw new HttpError(error.status ?? 401, error.message);
    if (!data.user || !data.session) throw new HttpError(401, 'Refresh token is invalid or expired.');
    return { user: data.user, session: data.session };
  }

  async logout(accessToken: string) {
    const { error } = await this.supabase.auth.admin.signOut(accessToken, 'global');
    if (error) throw new HttpError(error.status ?? 401, error.message);
  }
  async updatePassword(userId:string,password:string){const{error}=await this.supabase.auth.admin.updateUserById(userId,{password});if(error)throw new HttpError(error.status??400,error.message);}
}
