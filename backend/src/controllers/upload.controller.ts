import { Request, Response, NextFunction } from "express";
import { SecuredUploadRequest } from "../middleware/upload-security";
import { sendSuccess, sendError } from "../utils/apiResponse";

export class UploadController {
  static uploadImage(req: SecuredUploadRequest, res: Response, next: NextFunction) {
    if (!req.optimizedUrl) {
      return sendError(res, "Failed to upload and retrieve secure URL", 500);
    }
    
    sendSuccess(res, {
      url: req.optimizedUrl,
      thumbnailUrl: req.thumbnailUrl
    });
  }
}
