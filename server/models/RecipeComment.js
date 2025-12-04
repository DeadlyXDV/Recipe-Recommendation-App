const db = require('../config/database');

class RecipeComment {
  // Create a new comment
  static async create(userId, recipeId, commentText) {
    const query = 'INSERT INTO recipe_comments (user_id, recipe_id, comment_text) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [userId, recipeId, commentText]);
    return result;
  }

  // Get all comments for a recipe with user information
  static async getByRecipe(recipeId) {
    const query = `
      SELECT 
        rc.id,
        rc.user_id,
        rc.recipe_id,
        rc.comment_text,
        rc.created_at,
        rc.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM recipe_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.recipe_id = ?
      ORDER BY rc.created_at DESC
    `;
    const [rows] = await db.execute(query, [recipeId]);
    return rows;
  }

  // Get a specific comment by ID
  static async getById(commentId) {
    const query = `
      SELECT 
        rc.id,
        rc.user_id,
        rc.recipe_id,
        rc.comment_text,
        rc.created_at,
        rc.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM recipe_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.id = ?
    `;
    const [rows] = await db.execute(query, [commentId]);
    return rows[0];
  }

  // Delete a comment
  static async delete(commentId) {
    const query = 'DELETE FROM recipe_comments WHERE id = ?';
    const [result] = await db.execute(query, [commentId]);
    return result;
  }

  // Get all comments by a user
  static async getByUser(userId) {
    const query = `
      SELECT 
        rc.id,
        rc.recipe_id,
        rc.comment_text,
        rc.created_at,
        rc.updated_at
      FROM recipe_comments rc
      WHERE rc.user_id = ?
      ORDER BY rc.created_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Update a comment
  static async update(commentId, commentText) {
    const query = 'UPDATE recipe_comments SET comment_text = ? WHERE id = ?';
    const [result] = await db.execute(query, [commentText, commentId]);
    return result;
  }

  // Get comment count for a recipe
  static async getCountByRecipe(recipeId) {
    const query = 'SELECT COUNT(*) as count FROM recipe_comments WHERE recipe_id = ?';
    const [rows] = await db.execute(query, [recipeId]);
    return rows[0].count;
  }
}

module.exports = RecipeComment;
