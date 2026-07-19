import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const result = await AuthService.login(password);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
