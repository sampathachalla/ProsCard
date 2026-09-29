import type { MediaService } from '../media/services/media.service.js';
import { log } from '../src/logger.js';

export function startMediaCleanupJob(service:MediaService,intervalSeconds:number){
  if(intervalSeconds===0)return{stop(){}};let running=false;
  const run=async()=>{if(running)return;running=true;try{const result=await service.retryAllCleanup();if(result.examined>0)log('info','media_cleanup',result);}catch(error){log('error','media_cleanup_failed',{message:error instanceof Error?error.message:String(error)});}finally{running=false}};
  const timer=setInterval(()=>void run(),intervalSeconds*1000);timer.unref();void run();return{stop(){clearInterval(timer)}};
}
