import { query } from "../database/db";

export class AuthRepository {

  static async getAppUserByAuthId(authUserId: string) {
    const result = await query(
      "SELECT id, auth_user_id, email, role, status, created_at, updated_at FROM app_users WHERE auth_user_id = $1 AND deleted_at IS NULL",
      [authUserId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async createAppUser(authUserId: string, email: string, role: string, status: string) {
    const result = await query(
      "INSERT INTO app_users (auth_user_id, email, role, status) VALUES ($1, $2, $3, $4) RETURNING id, auth_user_id, email, role, status",
      [authUserId, email, role, status]
    );
    return result.rows[0];
  }
}
