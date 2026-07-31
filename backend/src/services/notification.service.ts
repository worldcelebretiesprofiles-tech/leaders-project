import { getPool } from "../database/db";

export class NotificationService {
  static async getUserNotifications(userId: string, limit = 50, offset = 0) {
    const pool = getPool();
    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const unreadCount = await pool.query(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);

    return {
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count, 10)
    };
  }

  static async markAsRead(userId: string, notificationId: number) {
    const pool = getPool();
    await pool.query(`
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
    `, [notificationId, userId]);
    return true;
  }

  static async markAllAsRead(userId: string) {
    const pool = getPool();
    await pool.query(`
      UPDATE notifications
      SET read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND read_at IS NULL
    `, [userId]);
    return true;
  }
}
