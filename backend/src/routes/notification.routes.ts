import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware as authenticate } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, NotificationController.getMyNotifications);
router.post("/me/:id/read", authenticate, NotificationController.markAsRead);
router.post("/me/read-all", authenticate, NotificationController.markAllAsRead);

export const notificationRoutes = router;
