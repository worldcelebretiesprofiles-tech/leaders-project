import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", CategoryController.getCategories);
router.post("/", authMiddleware, CategoryController.saveCategory);
router.delete("/:id", authMiddleware, CategoryController.deleteCategory);

export default router;
