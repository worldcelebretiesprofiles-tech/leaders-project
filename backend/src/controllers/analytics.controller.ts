import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/apiResponse";

export class AnalyticsController {
  static async getDashboardAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { getPool } = require("../database/db");
      const pool = getPool();
      const result = await pool.query(`SELECT * FROM dashboard_analytics`);
      sendSuccess(res, result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
}
