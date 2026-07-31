import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const data = await NotificationService.getUserNotifications(user.id, limit, offset);
      return res.json(data);
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const notificationId = parseInt(req.params.id, 10);
      await NotificationService.markAsRead(user.id, notificationId);
      return res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await NotificationService.markAllAsRead(user.id);
      return res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
