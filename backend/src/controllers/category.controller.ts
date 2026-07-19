import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { sendSuccess } from "../utils/apiResponse";

export class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getCategoriesWithSubcategories();
      sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }

  static async saveCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await CategoryService.saveCategory(req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory(parseInt(req.params.id, 10));
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  static async saveSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await CategoryService.saveSubcategory(req.body);
      sendSuccess(res, { success: true, id });
    } catch (err) {
      next(err);
    }
  }

  static async deleteSubcategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteSubcategory(parseInt(req.params.id, 10));
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
}
