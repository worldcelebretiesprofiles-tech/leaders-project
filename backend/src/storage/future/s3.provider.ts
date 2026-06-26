import { IStorageProvider } from "../storage.interface";

/**
 * Stub implementation of IStorageProvider for AWS S3.
 * Prepared for future migration to AWS S3 storage.
 */
export class S3Provider implements IStorageProvider {
  async uploadImage(buffer: Buffer, folder: string, filename: string): Promise<string> {
    console.log(`[AWS S3 Provider Stub] Uploading ${filename} (size: ${buffer.length} bytes) to folder: ${folder}`);
    // Future implementation will configure AWS.S3 client and call putObject
    return `https://s3.amazonaws.com/global-leader-sphere-bucket/${folder}/${filename}.webp`;
  }

  async deleteImage(url: string): Promise<void> {
    console.log(`[AWS S3 Provider Stub] Requesting deletion for URL: ${url}`);
  }
}
