import { createClient } from '@supabase/supabase-js';
import { loadConfig } from './config.js';
import { createPool } from './database.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { OciObjectStorageGateway } from '../media/services/oci-storage.service.js';
import { MediaRepository } from '../media/repository/media.repository.js';
import { MediaService } from '../media/services/media.service.js';
import { startMediaCleanupJob } from '../jobs/mediaCleanupJob.js';
import { configureLogger, log } from './logger.js';
import { OpenAiCardReader } from '../scanner/services/openai-card-reader.service.js';
import { AppleWalletPassGenerator, appleWalletConfigured } from '../wallet/services/apple-pass.service.js';
import { GoogleWalletLinkGenerator, googleWalletConfigured } from '../wallet/services/google-wallet.service.js';

const config=loadConfig();
configureLogger({environment:config.NODE_ENV,minimum:config.LOG_LEVEL,sinkUrl:config.LOG_SINK_URL,sinkToken:config.LOG_SINK_TOKEN});
const pool=createPool(config);
const supabase=createClient(config.SUPABASE_URL,config.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const storage=new OciObjectStorageGateway(config);
const cardReader=config.LLM_API?new OpenAiCardReader({apiKey:config.LLM_API,timeoutMs:config.LLM_TIMEOUT_MS}):undefined;
if(!cardReader)log('warn','card_reader_disabled',{reason:'LLM_API is not set'});
const appleWallet={passTypeId:config.APPLE_WALLET_PASS_TYPE_ID,teamId:config.APPLE_WALLET_TEAM_ID,certPath:config.APPLE_WALLET_CERT_PATH,keyPath:config.APPLE_WALLET_KEY_PATH,keyPassphrase:config.APPLE_WALLET_KEY_PASSPHRASE,wwdrPath:config.APPLE_WALLET_WWDR_PATH};
const googleWallet={issuerId:config.GOOGLE_WALLET_ISSUER_ID,serviceAccountPath:config.GOOGLE_WALLET_SERVICE_ACCOUNT_PATH};
const wallet={
  apple:appleWalletConfigured(appleWallet)?new AppleWalletPassGenerator(appleWallet):undefined,
  google:googleWalletConfigured(googleWallet)?new GoogleWalletLinkGenerator(googleWallet):undefined,
  linkSecret:config.WALLET_LINK_SECRET||undefined,
  publicBaseUrl:config.PUBLIC_WEB_URL||undefined,
};
log('info','wallet_passes',{apple:Boolean(wallet.apple),google:Boolean(wallet.google)});
const shareWebDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','web');
const app=createApp({db:pool,supabase,storage,cardReader,shareWebDir,wallet,scannerRateLimitMax:config.SCANNER_RATE_LIMIT_MAX,corsOrigins:config.CORS_ORIGINS.split(',').map(value=>value.trim()).filter(Boolean),authRateLimitMax:config.AUTH_RATE_LIMIT_MAX,passwordResetRedirectUrl:config.PASSWORD_RESET_REDIRECT_URL});
await pool.query('SELECT 1');
const cleanupJob=startMediaCleanupJob(new MediaService(new MediaRepository(pool),storage),config.MEDIA_CLEANUP_INTERVAL_SECONDS);
const server=app.listen(config.PORT,()=>log('info','server_started',{port:config.PORT}));
async function shutdown(){cleanupJob.stop();server.close();await pool.end();}
process.on('SIGINT',()=>void shutdown());process.on('SIGTERM',()=>void shutdown());
