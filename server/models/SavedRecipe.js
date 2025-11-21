const db = require('../config/database');

class SavedRecipe {
  // Simpan resep
  static async save(userId, recipeId, recipeName, recipeImage) {
    try {
      const [result] = await db.query(
        'INSERT INTO saved_recipes (user_id, recipe_id, recipe_name, recipe_image) VALUES (?, ?, ?, ?)',
        [userId, recipeId, recipeName, recipeImage]
      );
      
      return result.insertId;
    } catch (error) {
      // Jika duplikat (resep sudah disimpan), return null
      if (error.code === 'ER_DUP_ENTRY') {
        return null;
      }
      throw error;
    }
  }

  // Hapus resep yang disimpan
  static async remove(userId, recipeId) {
    try {
      const [result] = await db.query(
        'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
        [userId, recipeId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Ambil semua resep yang disimpan user
  static async findByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM saved_recipes WHERE user_id = ? ORDER BY saved_at DESC',
        [userId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cek apakah resep sudah disimpan
  static async isRecipeSaved(userId, recipeId) {
    try {
      const [rows] = await db.query(
        'SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
        [userId, recipeId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SavedRecipe;
