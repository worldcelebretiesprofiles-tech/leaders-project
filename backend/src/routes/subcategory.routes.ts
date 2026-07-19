import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, CategoryController.saveSubcategory);
router.delete("/:id", authMiddleware, CategoryController.deleteSubcategory);

export default router;
