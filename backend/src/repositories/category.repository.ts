import { query } from "../database/db";

export class CategoryRepository {
  static async getAllCategories() {
    const result = await query("SELECT id, name, slug FROM categories ORDER BY id ASC");
    return result.rows;
  }

  static async getAllSubcategories() {
    const result = await query("SELECT id, category_id, name, slug FROM subcategories ORDER BY id ASC");
    return result.rows;
  }

  static async createCategory(name: string, slug: string) {
    const result = await query(
      "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
      [name, slug]
    );
    return result.rows[0].id;
  }

  static async updateCategory(id: number, name: string, slug: string) {
    await query("UPDATE categories SET name = $1, slug = $2 WHERE id = $3", [name, slug, id]);
  }

  static async deleteCategory(id: number) {
    await query("DELETE FROM categories WHERE id = $1", [id]);
  }

  static async createSubcategory(categoryId: number, name: string, slug: string) {
    const result = await query(
      "INSERT INTO subcategories (category_id, name, slug) VALUES ($1, $2, $3) RETURNING id",
      [categoryId, name, slug]
    );
    return result.rows[0].id;
  }

  static async updateSubcategory(id: number, categoryId: number, name: string, slug: string) {
    await query(
      "UPDATE subcategories SET category_id = $1, name = $2, slug = $3 WHERE id = $4",
      [categoryId, name, slug, id]
    );
  }

  static async deleteSubcategory(id: number) {
    await query("DELETE FROM subcategories WHERE id = $1", [id]);
  }
}
