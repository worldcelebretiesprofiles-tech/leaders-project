import { AuthRepository } from "../repositories/auth.repository";
import { AppError } from "../utils/AppError";

export class AuthService {
  static async getMe(authUserId: string) {
    const user = await AuthRepository.getAppUserByAuthId(authUserId);
    if (!user) {
      throw new AppError("User profile not found in application database", 404);
    }
    return user;
  }
}
