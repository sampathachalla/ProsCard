import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Queryable } from './types.js';
import { errorHandler, HttpError } from './errors.js';
import { createAuthenticator } from './authenticate.js';
import { requestLogger, type RequestWithId } from './request-logger.js';
import { openApiDocument } from './openapi.js';
import { asyncHandler } from './async-handler.js';
import type { ObjectStorageGateway } from '../media/services/oci-storage.service.js';
import { AuthRepository } from '../auth/repository/auth.repository.js'; import { AuthService } from '../auth/services/auth.service.js'; import { AuthController } from '../auth/controller/auth.controller.js'; import { createAuthRouter } from '../auth/router/auth.router.js';
import { ProfileRepository } from '../profiles/repository/profile.repository.js'; import { ProfileService } from '../profiles/services/profile.service.js'; import { ProfileController } from '../profiles/controller/profile.controller.js'; import { createProfileRouter } from '../profiles/router/profile.router.js';
import { CardRepository } from '../cards/repository/card.repository.js'; import { CardService } from '../cards/services/card.service.js'; import { CardController } from '../cards/controller/card.controller.js'; import { createCardRouter } from '../cards/router/card.router.js';
import { ContactRepository } from '../contacts/repository/contact.repository.js'; import { ContactService } from '../contacts/services/contact.service.js'; import { ContactController } from '../contacts/controller/contact.controller.js'; import { createContactRouter } from '../contacts/router/contact.router.js';
import { OnboardingRepository } from '../onboarding/repository/onboarding.repository.js'; import { OnboardingService } from '../onboarding/services/onboarding.service.js'; import { OnboardingController } from '../onboarding/controller/onboarding.controller.js'; import { createOnboardingRouter } from '../onboarding/router/onboarding.router.js';
import { SharingRepository } from '../sharing/repository/sharing.repository.js'; import { SharingService } from '../sharing/services/sharing.service.js'; import { SharingController } from '../sharing/controller/sharing.controller.js'; import { createSharingRouter } from '../sharing/router/sharing.router.js';
import { MediaRepository } from '../media/repository/media.repository.js'; import { MediaService } from '../media/services/media.service.js'; import { MediaController } from '../media/controller/media.controller.js'; import { createMediaRouter } from '../media/router/media.router.js';
import { ScannerService } from '../scanner/services/scanner.service.js'; import { ScannerController } from '../scanner/controller/scanner.controller.js'; import { createScannerRouter } from '../scanner/router/scanner.router.js'; import type { CardReaderGateway } from '../scanner/services/openai-card-reader.service.js';
import { WalletRepository } from '../wallet/repository/wallet.repository.js'; import { WalletService } from '../wallet/services/wallet.service.js'; import { WalletController } from '../wallet/controller/wallet.controller.js'; import { createWalletRouter } from '../wallet/router/wallet.router.js'; import type { AppleWalletPassGenerator } from '../wallet/services/apple-pass.service.js'; import type { GoogleWalletLinkGenerator } from '../wallet/services/google-wallet.service.js';
import { AccountRepository } from '../account/repository/account.repository.js'; import { AccountService } from '../account/services/account.service.js'; import { AccountController } from '../account/controller/account.controller.js'; import { createAccountRouter } from '../account/router/account.router.js';

export type AppDependencies={db:Queryable;supabase:SupabaseClient;storage:ObjectStorageGateway;corsOrigins?:string[];authRateLimitMax?:number;passwordResetRedirectUrl?:string;cardReader?:CardReaderGateway;scannerRateLimitMax?:number;
  /** Folder with the exported web app (`npm run build:share` in app/); serves the public share page when present. */
  shareWebDir?:string;
  wallet?:{apple?:AppleWalletPassGenerator;google?:GoogleWalletLinkGenerator;linkSecret?:string;publicBaseUrl?:string}};

/**
 * Public card pages behind QR codes: the exported Expo web app, served at /share/:slug with its static
 * files. It gets its own CSP because card images redirect to OCI Object Storage.
 */
function mountShareWeb(app:express.Express,webDir:string){
  const index=path.join(webDir,'index.html');
  const webSecurity=helmet({
    contentSecurityPolicy:{directives:{
      'img-src':["'self'",'data:','blob:','https://*.oraclecloud.com'],
      'style-src':["'self'","'unsafe-inline'"],
      'font-src':["'self'",'data:'],
      'connect-src':["'self'"],
    }},
    crossOriginEmbedderPolicy:false,
  });
  const assets={immutable:true,maxAge:'365d',index:false} as const;
  app.use('/_expo',webSecurity,express.static(path.join(webDir,'_expo'),assets));
  app.use('/assets',webSecurity,express.static(path.join(webDir,'assets'),assets));
  // Checked per request so a fresh `npm run build:share` is picked up without restarting the API.
  app.get('/share/:slug', (_q, r, next) => {
    if (!existsSync(index)) {
      r.status(404).json({ message: 'Share page is not built. Run npm run build:share in app/.' });
      return;
    }
    next();
  }, webSecurity, (_q, r, next) => {
    r.set('Cache-Control', 'no-cache');
    r.sendFile(index, (error) => {
      if (error) next(error);
    });
  });
}
export function createApp(deps:AppDependencies){
  const app=express();app.disable('x-powered-by');if(deps.shareWebDir)mountShareWeb(app,deps.shareWebDir);app.use(helmet());app.use(requestLogger);app.use(cors({origin(origin,callback){if(!origin||!deps.corsOrigins?.length||deps.corsOrigins.includes(origin))return callback(null,true);callback(new HttpError(403,'Origin is not allowed.'))}}));app.use('/api/v1/scanner',express.json({limit:'8mb'}));app.use(express.json({limit:'1mb'}));
  const auth=createAuthenticator(deps.supabase);
  app.get('/health',(_q,r)=>r.json({status:'ok'}));
  app.get('/ready', asyncHandler(async (_q, r) => {
    try {
      await deps.db.query('SELECT 1');
      r.json({ status: 'ready', database: 'ok' });
    } catch {
      throw new HttpError(503, 'Database is not ready.');
    }
  }));
  app.get('/api-docs.json',(_q,r)=>r.json(openApiDocument));
  const mediaService=new MediaService(new MediaRepository(deps.db),deps.storage);
  app.use('/api/v1/auth',rateLimit({windowMs:60_000,limit:deps.authRateLimitMax??20,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many authentication requests. Try again shortly.'}}),createAuthRouter(new AuthController(new AuthService(new AuthRepository(deps.supabase,deps.passwordResetRedirectUrl))),auth));
  app.use('/api/v1/profiles',createProfileRouter(auth,new ProfileController(new ProfileService(new ProfileRepository(deps.db)))));
  app.use('/api/v1/cards',createCardRouter(auth,new CardController(new CardService(new CardRepository(deps.db),mediaService))));
  app.use('/api/v1/contacts',createContactRouter(auth,new ContactController(new ContactService(new ContactRepository(deps.db),mediaService))));
  app.use('/api/v1/onboarding',createOnboardingRouter(auth,new OnboardingController(new OnboardingService(new OnboardingRepository(deps.db)))));
  const sharingService=new SharingService(new SharingRepository(deps.db),deps.storage);
  app.use('/api/v1/wallet',createWalletRouter(auth,rateLimit({windowMs:60_000,limit:30,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many wallet requests. Try again shortly.'}}),new WalletController(new WalletService({repo:new WalletRepository(deps.db),sharing:sharingService,storage:deps.storage,...deps.wallet}))));
  app.use('/api/v1/sharing',createSharingRouter(auth,new SharingController(sharingService),rateLimit({windowMs:60_000,limit:300,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many requests. Try again shortly.'}})));
  app.use('/api/v1/scanner',createScannerRouter(auth,rateLimit({windowMs:60_000,limit:deps.scannerRateLimitMax??20,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Too many card scans. Try again shortly.'}}),new ScannerController(new ScannerService(deps.cardReader))));
  app.use('/api/v1/media',createMediaRouter(auth,new MediaController(mediaService)));
  app.use('/api/v1/account',createAccountRouter(auth,new AccountController(new AccountService(new AccountRepository(deps.db,deps.supabase),mediaService))));
  app.use((request, response) => {
    const requestId = (request as typeof request & RequestWithId).requestId;
    response.status(404).json({ message: 'Route not found.', requestId });
  });
  app.use(errorHandler);
  return app;
}
