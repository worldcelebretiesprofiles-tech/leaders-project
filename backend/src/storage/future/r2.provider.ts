import { IStorageProvider } from "../storage.interface";

/**
 * Stub implementation of IStorageProvider for Cloudflare R2.
 * Prepared for future migration to Cloudflare R2 storage.
 */
export class R2Provider implements IStorageProvider {
  async uploadImage(buffer: Buffer, folder: string, filename: string): Promise<string> {
    console.log(`[Cloudflare R2 Provider Stub] Uploading ${filename} (size: ${buffer.length} bytes) to folder: ${folder}`);
    // Future implementation will configure AWS S3 SDK compatibility layers for R2
    return `https://pub-some-unique-r2-id.r2.dev/${folder}/${filename}.webp`;
  }

  async deleteImage(url: string): Promise<void> {
    console.log(`[Cloudflare R2 Provider Stub] Requesting deletion for URL: ${url}`);
  }
}
