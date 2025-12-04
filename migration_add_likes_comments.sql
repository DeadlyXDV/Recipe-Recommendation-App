-- Migration: Add Likes, Comments, and User Interactions Tables
-- Date: 2025-12-04
-- Description: Adds support for recipe likes, comments, and recommendation tracking

USE recipe_app;

-- Table for recipe likes
CREATE TABLE IF NOT EXISTS recipe_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id VARCHAR(255) NOT NULL,
  liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_recipe_like (user_id, recipe_id),
  INDEX idx_recipe_likes (recipe_id),
  INDEX idx_user_likes (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for recipe comments
CREATE TABLE IF NOT EXISTS recipe_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id VARCHAR(255) NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recipe_comments (recipe_id),
  INDEX idx_user_comments (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for user recipe interactions (for recommendation algorithm)
CREATE TABLE IF NOT EXISTS user_recipe_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id VARCHAR(255) NOT NULL,
  recipe_category VARCHAR(255),
  recipe_area VARCHAR(255),
  interaction_type ENUM('like', 'save') NOT NULL,
  interaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_interactions (user_id),
  INDEX idx_interaction_type (interaction_type),
  INDEX idx_recipe_category (recipe_category),
  INDEX idx_recipe_area (recipe_area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to track migration
SELECT 'Migration completed: Likes, Comments, and User Interactions tables created successfully' AS status;
