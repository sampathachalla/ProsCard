import { readFileSync } from 'node:fs';
import * as common from 'oci-common';
import * as objectstorage from 'oci-objectstorage';
import type { AppConfig } from '../../src/config.js';
import { HttpError } from '../../src/errors.js';
import { log } from '../../src/logger.js';

export interface ObjectStorageGateway {
  createUploadUrl(objectName: string): Promise<{ url: string; expiresAt: Date }>;
  createDownloadUrl(objectName: string): Promise<{ url: string; expiresAt: Date }>;
  objectExists(objectName: string): Promise<boolean>;
  deleteObject(objectName: string): Promise<void>;
}

function storageUnavailable(error: unknown, action: string): never {
  log('error', 'oci_storage_failed', {
    action,
    message: error instanceof Error ? error.message : String(error),
    statusCode: (error as { statusCode?: number } | null)?.statusCode,
  });
  throw new HttpError(503, 'Media storage is temporarily unavailable.');
}

export class OciObjectStorageGateway implements ObjectStorageGateway {
  private readonly client: objectstorage.ObjectStorageClient;
  constructor(private readonly config: AppConfig) {
    const provider = new common.SimpleAuthenticationDetailsProvider(
      config.OCI_TENANCY_OCID,
      config.OCI_USER_OCID,
      config.OCI_FINGERPRINT,
      readFileSync(config.OCI_PRIVATE_KEY_PATH, 'utf8'),
      config.OCI_PRIVATE_KEY_PASSPHRASE || null,
      common.Region.fromRegionId(config.OCI_REGION),
    );
    this.client = new objectstorage.ObjectStorageClient({ authenticationDetailsProvider: provider });
  }
  private async signed(
    objectName: string,
    accessType: objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType,
    seconds: number,
  ) {
    try {
      const expiresAt = new Date(Date.now() + seconds * 1000);
      const result = await this.client.createPreauthenticatedRequest({
        namespaceName: this.config.OCI_NAMESPACE,
        bucketName: this.config.OCI_BUCKET_NAME,
        createPreauthenticatedRequestDetails: {
          name: `proscard-${Date.now()}`,
          objectName,
          accessType,
          timeExpires: expiresAt,
        },
      });
      const uri = result.preauthenticatedRequest.accessUri;
      return { url: `https://objectstorage.${this.config.OCI_REGION}.oraclecloud.com${uri}`, expiresAt };
    } catch (error) {
      storageUnavailable(error, 'signed_url');
    }
  }
  createUploadUrl(name: string) {
    return this.signed(
      name,
      objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectWrite,
      this.config.OCI_UPLOAD_URL_EXPIRES_SECONDS,
    );
  }
  createDownloadUrl(name: string) {
    return this.signed(
      name,
      objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,
      this.config.OCI_DOWNLOAD_URL_EXPIRES_SECONDS,
    );
  }
  async objectExists(name: string) {
    try {
      await this.client.headObject({
        namespaceName: this.config.OCI_NAMESPACE,
        bucketName: this.config.OCI_BUCKET_NAME,
        objectName: name,
      });
      return true;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404) return false;
      storageUnavailable(error, 'object_exists');
    }
  }
  async deleteObject(name: string) {
    try {
      await this.client.deleteObject({
        namespaceName: this.config.OCI_NAMESPACE,
        bucketName: this.config.OCI_BUCKET_NAME,
        objectName: name,
      });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 404) storageUnavailable(error, 'delete_object');
    }
  }
}

/**
 * Reuses signed download URLs instead of creating a new OCI pre-authenticated request for every image
 * view (each one is an OCI API call, ~0.2 s and up to seconds). A URL is reused while it has more than
 * `minRemainingMs` left, so clients always get one that stays valid for a while.
 */
export class CachedDownloadUrlStorage implements ObjectStorageGateway {
  private readonly cache = new Map<string, { url: string; expiresAt: Date }>();

  constructor(
    private readonly inner: ObjectStorageGateway,
    private readonly minRemainingMs = 2 * 60 * 1000,
    private readonly maxEntries = 5000,
  ) {}

  createUploadUrl(objectName: string) {
    return this.inner.createUploadUrl(objectName);
  }

  async createDownloadUrl(objectName: string) {
    const cached = this.cache.get(objectName);
    if (cached && cached.expiresAt.getTime() - Date.now() > this.minRemainingMs) return cached;
    const signed = await this.inner.createDownloadUrl(objectName);
    if (this.cache.size >= this.maxEntries) this.prune();
    this.cache.set(objectName, signed);
    return signed;
  }

  objectExists(objectName: string) {
    return this.inner.objectExists(objectName);
  }

  async deleteObject(objectName: string) {
    this.cache.delete(objectName);
    await this.inner.deleteObject(objectName);
  }

  private prune() {
    const now = Date.now();
    for (const [name, entry] of this.cache) {
      if (entry.expiresAt.getTime() <= now + this.minRemainingMs) this.cache.delete(name);
    }
    // Still full (all fresh): drop the oldest entries; Map iteration follows insertion order.
    for (const name of this.cache.keys()) {
      if (this.cache.size < this.maxEntries) break;
      this.cache.delete(name);
    }
  }
}
