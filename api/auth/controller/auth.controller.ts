import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../src/types.js';
import type { AuthService } from '../services/auth.service.js';
import { HttpError } from '../../src/errors.js';
import { credentialsSchema, forgotPasswordSchema, newPasswordSchema, refreshSchema } from '../utils/auth.schemas.js';

export class AuthController {
  constructor(private readonly service: AuthService) {}
  signup = async (request: Request, response: Response) => {
    const input = credentialsSchema.parse(request.body);
    response.status(201).json(await this.service.signup(input.email, input.password));
  };
  login = async (request: Request, response: Response) => {
    const input = credentialsSchema.parse(request.body);
    response.json(await this.service.login(input.email, input.password));
  };
  forgotPassword = async (request: Request, response: Response) => {
    const input = forgotPasswordSchema.parse(request.body);
    response.status(202).json(await this.service.forgotPassword(input.email));
  };
  refresh = async (request: Request, response: Response) => {
    const input = refreshSchema.parse(request.body);
    response.json(await this.service.refresh(input.refreshToken));
  };
  logout = async (request: Request, response: Response) => {
    const token=request.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    if(!token)throw new HttpError(401,'A bearer token is required.');
    response.json(await this.service.logout(token));
  };
  updatePassword=async(request:AuthenticatedRequest,response:Response)=>{const input=newPasswordSchema.parse(request.body);response.json(await this.service.updatePassword(request.user.id,input.password));};
  me=async(request:AuthenticatedRequest,response:Response)=>response.json(this.service.currentUser(request.user));
}
