const db = require('../config/database');

class UserRecipeInteraction {
  // Track a new interaction
  static async create(userId, recipeId, recipeCategory, recipeArea, interactionType) {
    const query = `
      INSERT INTO user_recipe_interactions 
      (user_id, recipe_id, recipe_category, recipe_area, interaction_type) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [userId, recipeId, recipeCategory, recipeArea, interactionType]);
    return result;
  }

  // Get user's top categories based on interactions
  static async getTopCategories(userId, limit = 3) {
    const query = `
      SELECT recipe_category, COUNT(*) as count
      FROM user_recipe_interactions
      WHERE user_id = ? AND recipe_category IS NOT NULL
      GROUP BY recipe_category
      ORDER BY count DESC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [userId, limit]);
    return rows.map(row => row.recipe_category);
  }

  // Get user's top areas based on interactions
  static async getTopAreas(userId, limit = 3) {
    const query = `
      SELECT recipe_area, COUNT(*) as count
      FROM user_recipe_interactions
      WHERE user_id = ? AND recipe_area IS NOT NULL
      GROUP BY recipe_area
      ORDER BY count DESC
      LIMIT ?
    `;
    const [rows] = await db.execute(query, [userId, limit]);
    return rows.map(row => row.recipe_area);
  }

  // Get all interactions by user
  static async getByUser(userId) {
    const query = `
      SELECT *
      FROM user_recipe_interactions
      WHERE user_id = ?
      ORDER BY interaction_date DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Get interaction statistics for user
  static async getUserStats(userId) {
    const query = `
      SELECT 
        interaction_type,
        COUNT(*) as count
      FROM user_recipe_interactions
      WHERE user_id = ?
      GROUP BY interaction_type
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Delete interaction when user unlikes or unsaves
  static async deleteByRecipeAndType(userId, recipeId, interactionType) {
    const query = `
      DELETE FROM user_recipe_interactions 
      WHERE user_id = ? AND recipe_id = ? AND interaction_type = ?
    `;
    const [result] = await db.execute(query, [userId, recipeId, interactionType]);
    return result;
  }
}

module.exports = UserRecipeInteraction;
