import { createServer } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { configureLogger, log } from '../../src/logger.js';

afterEach(()=>configureLogger({sinkUrl:undefined,sinkToken:undefined,minimum:'info'}));

describe('centralized logger',()=>{
  it('forwards structured JSON to an authenticated HTTP sink',async()=>{
    let resolveEntry!:(value:{body:Record<string,unknown>;authorization?:string})=>void;
    const received=new Promise<{body:Record<string,unknown>;authorization?:string}>(resolve=>{resolveEntry=resolve});
    const server=createServer((request,response)=>{let raw='';request.on('data',chunk=>{raw+=String(chunk)});request.on('end',()=>{resolveEntry({body:JSON.parse(raw) as Record<string,unknown>,authorization:request.headers.authorization});response.statusCode=204;response.end()})});
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    try{const address=server.address();if(!address||typeof address==='string')throw new Error('Test log server did not bind.');configureLogger({environment:'test',sinkUrl:`http://127.0.0.1:${address.port}/logs`,sinkToken:'test-token'});log('info','central_sink_test',{requestId:'request-1'});const entry=await Promise.race([received,new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('Log sink timeout')),2000))]);expect(entry.authorization).toBe('Bearer test-token');expect(entry.body.event).toBe('central_sink_test');expect(entry.body.requestId).toBe('request-1');expect(entry.body.environment).toBe('test');}finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
  });
});
