export interface IStorageProvider {
  /**
   * Upload an image buffer to storage and return its public URL.
   * @param buffer The file content buffer to upload.
   * @param folder The target folder/namespace in storage.
   * @param filename The desired filename or prefix (without extension).
   */
  uploadImage(buffer: Buffer, folder: string, filename: string): Promise<string>;

  /**
   * Delete an image from storage using its public URL or identifier.
   * @param url The public URL of the image to delete.
   */
  deleteImage(url: string): Promise<void>;
}
