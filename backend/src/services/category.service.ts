import { CategoryRepository } from "../repositories/category.repository";
import { AppError } from "../utils/AppError";

export class CategoryService {
  static async getCategoriesWithSubcategories() {
    const categories = await CategoryRepository.getAllCategories();
    const subcategories = await CategoryRepository.getAllSubcategories();

    return categories.map((cat: any) => ({
      ...cat,
      subcategories: subcategories.filter((sub: any) => sub.category_id === cat.id),
    }));
  }

  static async saveCategory(cat: any) {
    if (!cat.name || !cat.slug) {
      throw new AppError("Category Name and Slug are required", 400);
    }

    if (cat.id) {
      await CategoryRepository.updateCategory(cat.id, cat.name, cat.slug);
      return cat.id;
    } else {
      return await CategoryRepository.createCategory(cat.name, cat.slug);
    }
  }

  static async deleteCategory(id: number) {
    await CategoryRepository.deleteCategory(id);
  }

  static async saveSubcategory(sub: any) {
    if (!sub.category_id || !sub.name || !sub.slug) {
      throw new AppError("Category ID, Name and Slug are required fields", 400);
    }

    if (sub.id) {
      await CategoryRepository.updateSubcategory(sub.id, parseInt(sub.category_id, 10), sub.name, sub.slug);
      return sub.id;
    } else {
      return await CategoryRepository.createSubcategory(parseInt(sub.category_id, 10), sub.name, sub.slug);
    }
  }

  static async deleteSubcategory(id: number) {
    await CategoryRepository.deleteSubcategory(id);
  }
}
