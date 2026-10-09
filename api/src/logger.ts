type Level='debug'|'info'|'warn'|'error';
const weights:Record<Level,number>={debug:10,info:20,warn:30,error:40};
let settings:{service:string;environment:string;minimum:Level;sinkUrl?:string;sinkToken?:string}={service:'proscard-api',environment:'development',minimum:'info'};

export function configureLogger(input:Partial<typeof settings>){settings={...settings,...input};}
export function log(level:Level,event:string,data:Record<string,unknown>={}){
  if(weights[level]<weights[settings.minimum])return;
  const entry={timestamp:new Date().toISOString(),level,event,service:settings.service,environment:settings.environment,...data};
  // Logging must never throw: a circular or BigInt value in `data` falls back to a minimal entry.
  let line:string;try{line=JSON.stringify(entry);}catch{line=JSON.stringify({timestamp:entry.timestamp,level,event,service:settings.service,environment:settings.environment,note:'log data was not serializable'});}
  (level==='error'?console.error:level==='warn'?console.warn:console.log)(line);
  if(settings.sinkUrl){void fetch(settings.sinkUrl,{method:'POST',headers:{'Content-Type':'application/json',...(settings.sinkToken?{Authorization:`Bearer ${settings.sinkToken}`}:{})},body:line,signal:AbortSignal.timeout(5000)}).catch(error=>console.error(JSON.stringify({timestamp:new Date().toISOString(),level:'warn',event:'log_sink_failed',service:settings.service,message:error instanceof Error?error.message:String(error)})));}
}
