-- Database: recipe_app
CREATE DATABASE IF NOT EXISTS recipe_app;
USE recipe_app;

-- Tabel Users untuk menyimpan data pengguna
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Saved Recipes untuk menyimpan resep yang disimpan pengguna
CREATE TABLE IF NOT EXISTS saved_recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipe_id VARCHAR(255) NOT NULL,
  recipe_name VARCHAR(255) NOT NULL,
  recipe_image TEXT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_recipe (user_id, recipe_id)
);

-- Index untuk meningkatkan performa query
CREATE INDEX idx_user_id ON saved_recipes(user_id);
CREATE INDEX idx_email ON users(email);
