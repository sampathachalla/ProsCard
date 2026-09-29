import { readFileSync } from 'node:fs';
import * as common from 'oci-common';
import * as objectstorage from 'oci-objectstorage';
import type { AppConfig } from '../../src/config.js';

export interface ObjectStorageGateway {
  createUploadUrl(objectName:string):Promise<{url:string;expiresAt:Date}>;
  createDownloadUrl(objectName:string):Promise<{url:string;expiresAt:Date}>;
  objectExists(objectName:string):Promise<boolean>;
  deleteObject(objectName:string):Promise<void>;
}

export class OciObjectStorageGateway implements ObjectStorageGateway {
  private readonly client:objectstorage.ObjectStorageClient;
  constructor(private readonly config:AppConfig){
    const provider=new common.SimpleAuthenticationDetailsProvider(config.OCI_TENANCY_OCID,config.OCI_USER_OCID,config.OCI_FINGERPRINT,readFileSync(config.OCI_PRIVATE_KEY_PATH,'utf8'),config.OCI_PRIVATE_KEY_PASSPHRASE||null,common.Region.fromRegionId(config.OCI_REGION));
    this.client=new objectstorage.ObjectStorageClient({authenticationDetailsProvider:provider});
  }
  private async signed(objectName:string,accessType:objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType,seconds:number){
    const expiresAt=new Date(Date.now()+seconds*1000);
    const result=await this.client.createPreauthenticatedRequest({namespaceName:this.config.OCI_NAMESPACE,bucketName:this.config.OCI_BUCKET_NAME,createPreauthenticatedRequestDetails:{name:`proscard-${Date.now()}`,objectName,accessType,timeExpires:expiresAt}});
    const uri=result.preauthenticatedRequest.accessUri;
    return{url:`https://objectstorage.${this.config.OCI_REGION}.oraclecloud.com${uri}`,expiresAt};
  }
  createUploadUrl(name:string){return this.signed(name,objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite,this.config.OCI_UPLOAD_URL_EXPIRES_SECONDS)}
  createDownloadUrl(name:string){return this.signed(name,objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,this.config.OCI_DOWNLOAD_URL_EXPIRES_SECONDS)}
  async objectExists(name:string){try{await this.client.headObject({namespaceName:this.config.OCI_NAMESPACE,bucketName:this.config.OCI_BUCKET_NAME,objectName:name});return true}catch(error){const status=(error as {statusCode?:number}).statusCode;if(status===404)return false;throw error;}}
  async deleteObject(name:string){try{await this.client.deleteObject({namespaceName:this.config.OCI_NAMESPACE,bucketName:this.config.OCI_BUCKET_NAME,objectName:name});}catch(error){if((error as {statusCode?:number}).statusCode!==404)throw error;}}
}
