import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth";
import { uploadMiddleware, processAndUploadImage } from "../middleware/upload-security";

const router = Router();

router.post(
  "/",
  authMiddleware,
  uploadMiddleware.single("file"),
  processAndUploadImage,
  UploadController.uploadImage
);

export default router;
