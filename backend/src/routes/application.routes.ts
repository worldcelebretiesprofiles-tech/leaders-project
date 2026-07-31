import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

const router = Router();

// Middleware to enforce Admin only access
const adminOnly = (req: AuthenticatedRequest, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) {
    return next(new AppError("Forbidden: Admins only", 403));
  }
  next();
};

// Public endpoint for submitting applications
router.post("/", ApplicationController.submitApplication);

// Admin endpoints
router.get("/", authMiddleware, adminOnly, ApplicationController.listApplications);
router.get("/:id", authMiddleware, adminOnly, ApplicationController.getApplication);
router.put("/:id/status", authMiddleware, adminOnly, ApplicationController.reviewApplication);

export default router;
