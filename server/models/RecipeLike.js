const db = require('../config/database');

class RecipeLike {
  // Create a new like
  static async create(userId, recipeId) {
    const query = 'INSERT INTO recipe_likes (user_id, recipe_id) VALUES (?, ?)';
    const [result] = await db.execute(query, [userId, recipeId]);
    return result;
  }

  // Delete a like
  static async delete(userId, recipeId) {
    const query = 'DELETE FROM recipe_likes WHERE user_id = ? AND recipe_id = ?';
    const [result] = await db.execute(query, [userId, recipeId]);
    return result;
  }

  // Get like count for a specific recipe
  static async getCountByRecipe(recipeId) {
    const query = 'SELECT COUNT(*) as count FROM recipe_likes WHERE recipe_id = ?';
    const [rows] = await db.execute(query, [recipeId]);
    return rows[0].count;
  }

  // Check if user has liked a recipe
  static async checkIfUserLiked(userId, recipeId) {
    const query = 'SELECT * FROM recipe_likes WHERE user_id = ? AND recipe_id = ?';
    const [rows] = await db.execute(query, [userId, recipeId]);
    return rows.length > 0;
  }

  // Get all liked recipes by user
  static async getAllByUser(userId) {
    const query = `
      SELECT recipe_id, liked_at 
      FROM recipe_likes 
      WHERE user_id = ? 
      ORDER BY liked_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Get all users who liked a recipe
  static async getUsersWhoLiked(recipeId) {
    const query = `
      SELECT u.id, u.name, u.email, rl.liked_at
      FROM recipe_likes rl
      JOIN users u ON rl.user_id = u.id
      WHERE rl.recipe_id = ?
      ORDER BY rl.liked_at DESC
    `;
    const [rows] = await db.execute(query, [recipeId]);
    return rows;
  }
}

module.exports = RecipeLike;
