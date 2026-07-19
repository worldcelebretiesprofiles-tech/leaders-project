import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import { AppError } from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_key_change_in_prod";

export class AuthService {
  static async login(password: string) {
    if (!password) {
      throw new AppError("Password is required", 400);
    }

    const admin = await AuthRepository.getAdminByUsername("admin");
    if (!admin) {
      throw new AppError("No administrator account found in database. Please run the seed script.", 500);
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }

    const token = jwt.sign({ username: "admin", role: "admin" }, JWT_SECRET, {
      expiresIn: "365d",
    });

    return { token };
  }
}
