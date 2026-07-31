import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Only Super Admins and Admins should see the dashboard
router.get("/", authMiddleware, AnalyticsController.getDashboardAnalytics);
router.get("/dashboard", authMiddleware, AnalyticsController.getDashboardAnalytics);

export default router;
