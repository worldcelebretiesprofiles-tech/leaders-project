import { query } from "../database/db";

export class AuthRepository {
  static async getAdminByUsername(username: string) {
    const result = await query("SELECT password_hash FROM admins WHERE username = $1", [username]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }
}
