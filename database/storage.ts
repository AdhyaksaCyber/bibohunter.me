import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';

export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
}

export interface StorageDownloadResult {
  buffer: ArrayBuffer | Buffer;
  contentType: string;
}

export interface IStorageAdapter {
  upload(
    file: Buffer,
    filename: string,
    contentType: string,
    folder?: string
  ): Promise<StorageUploadResult>;

  download(key: string): Promise<StorageDownloadResult>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  getUrl(key: string): string;
}

// Local File Storage (Development)
export class LocalStorageAdapter implements IStorageAdapter {
  private baseDir: string;

  constructor(baseDir: string = './uploads') {
    this.baseDir = baseDir;
    // Ensure base directory exists
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(
    file: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'files'
  ): Promise<StorageUploadResult> {
    const folderPath = join(this.baseDir, folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const fileId = nanoid();
    const ext = filename.split('.').pop() || '';
    const key = `${folder}/${fileId}.${ext}`;
    const fullPath = join(this.baseDir, key);

    writeFileSync(fullPath, file);

    return {
      key,
      url: `/uploads/${key}`,
      size: file.length,
    };
  }

  async download(key: string): Promise<StorageDownloadResult> {
    const fullPath = join(this.baseDir, key);

    if (!existsSync(fullPath)) {
      throw new Error(`File not found: ${key}`);
    }

    const buffer = readFileSync(fullPath);
    const contentType = this.getContentType(key);

    return { buffer, contentType };
  }

  async delete(key: string): Promise<void> {
    const fullPath = join(this.baseDir, key);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = join(this.baseDir, key);
    return existsSync(fullPath);
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      csv: 'text/csv',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// Cloudflare R2 Storage (Production)
export class R2StorageAdapter implements IStorageAdapter {
  private bucket: R2Bucket;
  private baseUrl: string;

  constructor(bucket: R2Bucket, baseUrl: string = '') {
    this.bucket = bucket;
    this.baseUrl = baseUrl;
  }

  async upload(
    file: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'files'
  ): Promise<StorageUploadResult> {
    const fileId = nanoid();
    const ext = filename.split('.').pop() || '';
    const key = `${folder}/${fileId}.${ext}`;

    await this.bucket.put(key, file, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=3600',
      },
    });

    const url = this.baseUrl ? `${this.baseUrl}/${key}` : `/r2/${key}`;

    return {
      key,
      url,
      size: file.length,
    };
  }

  async download(key: string): Promise<StorageDownloadResult> {
    const object = await this.bucket.get(key);

    if (!object) {
      throw new Error(`File not found: ${key}`);
    }

    const buffer = await object.arrayBuffer();
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream';

    return { buffer, contentType };
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const object = await this.bucket.head(key);
    return !!object;
  }

  getUrl(key: string): string {
    return this.baseUrl ? `${this.baseUrl}/${key}` : `/r2/${key}`;
  }
}

// Storage Adapter Factory
export function createStorageAdapter(env?: {
  R2?: R2Bucket;
  R2_BUCKET_URL?: string;
}): IStorageAdapter {
  if (env?.R2) {
    // Production: Cloudflare R2
    return new R2StorageAdapter(env.R2, env.R2_BUCKET_URL || '');
  } else {
    // Development: Local File Storage
    return new LocalStorageAdapter();
  }
}

export type StorageAdapter = IStorageAdapter;
