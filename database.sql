-- ============ DATABASE CREATION ============
CREATE DATABASE IF NOT EXISTS graycie_glasses;
CREATE USER IF NOT EXISTS 'graycie_app'@'localhost' IDENTIFIED BY 'GraycieApp2026!';
GRANT ALL PRIVILEGES ON graycie_glasses.* TO 'graycie_app'@'localhost';
FLUSH PRIVILEGES;
USE graycie_glasses;

-- ============ ADMIN TABLE ============
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============ PRODUCTS TABLE ============
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  list VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============ INSERT DEFAULT ADMIN ============
-- Username: admin | Password: graycieofficialadmin123
-- Password hash: bcryptjs (10 rounds)
INSERT INTO admins (username, email, password) VALUES 
(
  'admin', 
  'hello@graycieglasses.com', 
  '$2a$10$oP9DNZHyY3teH.MJzspMCuka9bM4a9xZTpul3dh1lxNJES4Jbjn4W'
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password = VALUES(password);

-- ============ INSERT SAMPLE PRODUCTS ============
INSERT INTO products (name, list, price, imageUrl) VALUES
(
  'Lagosian Gold Aviator',
  'Sunglasses',
  189000,
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80'
),
(
  'Atelier Round — Tortoise',
  'Sunglasses',
  165000,
  'https://images.unsplash.com/photo-1577803645773-f96470509666?w=600&q=80'
),
(
  'Victoria Cat-Eye',
  'Sunglasses',
  210000,
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80'
),
(
  'Adeola Square Frame',
  'Eyeglasses',
  145000,
  'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80'
),
(
  'Onyx Wraparound',
  'Sunglasses',
  175000,
  'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&q=80'
),
(
  'Heritage Wire-Rim',
  'Eyeglasses',
  132000,
  'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80'
);
