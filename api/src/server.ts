import { createClient } from '@supabase/supabase-js';
import { loadConfig } from './config.js';
import { createPool } from './database.js';
import { createApp } from './app.js';
import { OciObjectStorageGateway } from '../media/services/oci-storage.service.js';
import { MediaRepository } from '../media/repository/media.repository.js';
import { MediaService } from '../media/services/media.service.js';
import { startMediaCleanupJob } from '../jobs/mediaCleanupJob.js';
import { configureLogger, log } from './logger.js';

const config=loadConfig();
configureLogger({environment:config.NODE_ENV,minimum:config.LOG_LEVEL,sinkUrl:config.LOG_SINK_URL,sinkToken:config.LOG_SINK_TOKEN});
const pool=createPool(config);
const supabase=createClient(config.SUPABASE_URL,config.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const storage=new OciObjectStorageGateway(config);
const app=createApp({db:pool,supabase,storage,corsOrigins:config.CORS_ORIGINS.split(',').map(value=>value.trim()).filter(Boolean),authRateLimitMax:config.AUTH_RATE_LIMIT_MAX,passwordResetRedirectUrl:config.PASSWORD_RESET_REDIRECT_URL});
await pool.query('SELECT 1');
const cleanupJob=startMediaCleanupJob(new MediaService(new MediaRepository(pool),storage),config.MEDIA_CLEANUP_INTERVAL_SECONDS);
const server=app.listen(config.PORT,()=>log('info','server_started',{port:config.PORT}));
async function shutdown(){cleanupJob.stop();server.close();await pool.end();}
process.on('SIGINT',()=>void shutdown());process.on('SIGTERM',()=>void shutdown());
