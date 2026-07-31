import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { authLimiter } from "../middleware/rate-limiter";

const router = Router();

router.post("/login", authLimiter, AuthController.login);
router.get("/me", authMiddleware, AuthController.getMe);

export default router;
