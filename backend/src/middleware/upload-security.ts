import { Request, Response, NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import { CloudinaryProvider } from "../storage/cloudinary.provider";

// Memory storage for multer (zero local disk footprints)
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max size
  },
});

const storageProvider = new CloudinaryProvider();

/**
 * Validates file headers (magic numbers) to verify the actual file type matches
 * JPEG, PNG, or WebP.
 */
function isValidImage(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG magic number: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG magic number: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }

  // WEBP magic number: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12
  ) {
    const webpHeader = buffer.toString("ascii", 8, 12);
    if (webpHeader === "WEBP") {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes the filename by stripping non-alphanumeric characters.
 */
function sanitizeFilename(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
  return base.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
}

export interface SecuredUploadRequest extends Request {
  optimizedUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Validates the image structure and formats/optimizes it to WebP in-memory.
 * Then uploads both the main optimized image and the thumbnail directly to Cloudinary.
 */
export async function processAndUploadImage(
  req: SecuredUploadRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.file;

  // 1. Validate file extension
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
  const fileExt = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();
  if (!allowedExts.includes(fileExt)) {
    return res.status(400).json({
      error: "Invalid file extension. Only JPG, JPEG, PNG, and WebP are allowed.",
    });
  }

  // 2. Validate MIME type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      error: "Invalid MIME type. Only JPG, JPEG, PNG, and WebP are allowed.",
    });
  }

  // 3. Validate magic numbers (headers)
  if (!isValidImage(file.buffer)) {
    return res.status(400).json({
      error: "Invalid file signature. The uploaded file is not a valid image.",
    });
  }

  try {
    const filenameBase = sanitizeFilename(file.originalname);
    const timeSuffix = Date.now();
    const mainFilename = `${filenameBase}_${timeSuffix}`;
    const thumbFilename = `${filenameBase}_thumb_${timeSuffix}`;

    // Process main image in-memory via sharp (max width 1200px, quality 80%, WebP)
    const mainBuffer = await sharp(file.buffer)
      .resize({ width: 1200, height: 1200, fit: sharp.fit.inside, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Process thumbnail in-memory via sharp (max width 300px, quality 70%, WebP)
    const thumbBuffer = await sharp(file.buffer)
      .resize({ width: 300, height: 300, fit: sharp.fit.inside, withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer();

    // Upload directly to Cloudinary
    const [mainUrl, thumbnailUrl] = await Promise.all([
      storageProvider.uploadImage(mainBuffer, "portraits", mainFilename),
      storageProvider.uploadImage(thumbBuffer, "portraits", thumbFilename),
    ]);

    req.optimizedUrl = mainUrl;
    req.thumbnailUrl = thumbnailUrl;
    next();
  } catch (err: any) {
    console.error("Image processing/upload failed:", err);
    return res.status(500).json({
      error: "Failed to process and upload image: " + (err.message || err),
    });
  }
}
