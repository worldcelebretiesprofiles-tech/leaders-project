import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthenticatedRequest } from "../middleware/auth";

export class AuthController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user || !authReq.user.auth_user_id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await AuthService.getMe(authReq.user.auth_user_id);

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
