import type { Session, User } from '@supabase/supabase-js';
import type { AuthRepository } from '../repository/auth.repository.js';

function responsePayload(result: { user: User; session: Session | null }) {
  return {
    user: { id: result.user.id, username: result.user.email ?? '' },
    token: result.session?.access_token,
    refreshToken: result.session?.refresh_token,
    emailConfirmationRequired: !result.session,
  };
}

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}
  async signup(email: string, password: string) {
    return responsePayload(await this.repository.signup(email, password));
  }
  async login(email: string, password: string) {
    return responsePayload(await this.repository.login(email, password));
  }
  async googleOAuthUrl(redirectTo: string) {
    return { url: await this.repository.googleOAuthUrl(redirectTo) };
  }
  async forgotPassword(email: string) {
    await this.repository.requestPasswordReset(email);
    return { message: 'If an account exists, password reset instructions have been sent.' };
  }
  async refresh(refreshToken: string) {
    return responsePayload(await this.repository.refresh(refreshToken));
  }
  async logout(accessToken: string) {
    await this.repository.logout(accessToken);
    return { message: 'Signed out.' };
  }
  currentUser(user: { id: string; email: string }) {
    return { user: { id: user.id, username: user.email } };
  }
  async updatePassword(userId:string,password:string){await this.repository.updatePassword(userId,password);return{message:'Password updated.'};}
}
