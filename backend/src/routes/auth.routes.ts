import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rate-limiter";

const router = Router();

router.post("/login", authLimiter, AuthController.login);

export default router;
