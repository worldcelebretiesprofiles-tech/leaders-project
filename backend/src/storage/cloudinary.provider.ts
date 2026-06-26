import { v2 as cloudinary } from "cloudinary";
import { IStorageProvider } from "./storage.interface";
import fs from "node:fs";
import path from "node:path";

export class CloudinaryProvider implements IStorageProvider {
  private isMock = false;
  private mockUploadsDir = "";

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn(
        "WARNING: Cloudinary credentials missing in environment variables. Falling back to local mock storage."
      );
      this.isMock = true;
      // Setup a mock uploads folder in public/uploads for local development
      this.mockUploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(this.mockUploadsDir)) {
        fs.mkdirSync(this.mockUploadsDir, { recursive: true });
      }
    } else {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async uploadImage(buffer: Buffer, folder: string, filename: string): Promise<string> {
    if (this.isMock) {
      // Mock upload: write buffer to local file and return local route url
      const cleanFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}.webp`;
      const targetDir = path.join(this.mockUploadsDir, folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const filePath = path.join(targetDir, cleanFilename);
      await fs.promises.writeFile(filePath, buffer);
      return `/uploads/${folder}/${cleanFilename}`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: filename,
          resource_type: "image",
          format: "webp",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Cloudinary upload returned no result"));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  async deleteImage(url: string): Promise<void> {
    if (this.isMock) {
      // Mock delete: delete local file if url starts with /uploads/
      if (url.startsWith("/uploads/")) {
        const relativePath = url.replace("/uploads/", "");
        const filePath = path.join(this.mockUploadsDir, relativePath);
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        } catch (err) {
          console.error("Failed to delete mock upload file:", err);
        }
      }
      return;
    }

    try {
      const parts = url.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex === -1) return;

      // Extract parts after the version tag (e.g. v12345678)
      let publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
      // Remove file extension
      const dotIndex = publicIdWithExt.lastIndexOf(".");
      const publicId = dotIndex !== -1 ? publicIdWithExt.substring(0, dotIndex) : publicIdWithExt;

      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }
  }
}
