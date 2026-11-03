-- Opwatch — MariaDB / MySQL schema
-- Run automatically by the installer, or manually: mysql -u root -p < server/db/schema.sql

CREATE DATABASE IF NOT EXISTS `opwatch` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `opwatch`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `chats`;
DROP TABLE IF EXISTS `pages`;
DROP TABLE IF EXISTS `branches`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `promotions`;
DROP TABLE IF EXISTS `campaigns`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `customers`;

CREATE TABLE `brands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `name_en` VARCHAR(160) NULL,
  `name_th` VARCHAR(160) NULL,
  `country` VARCHAR(60) NULL,
  `country_en` VARCHAR(60) NULL,
  `movement` VARCHAR(120) NULL,
  `movement_en` VARCHAR(120) NULL,
  `positioning` VARCHAR(40) NULL,
  `tagline` VARCHAR(220) NULL,
  `tagline_en` VARCHAR(220) NULL,
  `story` TEXT NULL,
  `story_en` TEXT NULL,
  `accent_color` VARCHAR(20) NOT NULL DEFAULT '#b98a44',
  `logo` VARCHAR(500) NULL,
  `hero_image` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_slug_unique` (`slug`),
  KEY `brands_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `name_en` VARCHAR(160) NULL,
  `name_th` VARCHAR(160) NULL,
  `parent_id` INT NULL,
  `description` TEXT NULL,
  `description_en` TEXT NULL,
  `description_th` TEXT NULL,
  `image` VARCHAR(500) NULL,
  `icon` VARCHAR(500) NULL,
  `banner_image` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id` (`parent_id`),
  KEY `categories_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(64) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `name_en` VARCHAR(200) NULL,
  `name_th` VARCHAR(200) NULL,
  `slug` VARCHAR(220) NOT NULL,
  `brand_id` INT NULL,
  `brand` VARCHAR(100) NULL,
  `category_id` INT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `original_price` DECIMAL(12,2) NULL,
  `price_compare` DECIMAL(12,2) NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'THB',
  `images` JSON NULL,
  `short_description` TEXT NULL,
  `description` TEXT NULL,
  `description_en` TEXT NULL,
  `description_th` TEXT NULL,
  `specs` JSON NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `status` ENUM('active','draft') NOT NULL DEFAULT 'active',
  `badges` JSON NULL,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(220) NULL,
  `seo_description` VARCHAR(360) NULL,
  `seo_keywords` VARCHAR(360) NULL,
  `aseo_summary` TEXT NULL,
  `aseo_faqs` JSON NULL,
  `shopee_url` VARCHAR(500) NULL,
  `shopee_item_id` VARCHAR(80) NULL,
  `video_url` VARCHAR(500) NULL,
  `gift_wrap_available` TINYINT(1) NOT NULL DEFAULT 1,
  `points_multiplier` DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `products_brand_id` (`brand_id`),
  KEY `products_category_id` (`category_id`),
  KEY `products_status` (`status`),
  CONSTRAINT `products_brands_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL,
  CONSTRAINT `products_categories_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `campaigns` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `title` VARCHAR(200) NULL,
  `title_en` VARCHAR(200) NULL,
  `title_th` VARCHAR(200) NULL,
  `subtitle` VARCHAR(220) NULL,
  `subtitle_en` VARCHAR(220) NULL,
  `subtitle_th` VARCHAR(220) NULL,
  `banner` VARCHAR(500) NULL,
  `link` VARCHAR(500) NULL,
  `brand_id` INT NULL,
  `type` ENUM('hero','brand-day','category','strip','event') NOT NULL DEFAULT 'hero',
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaigns_slug_unique` (`slug`),
  KEY `campaigns_type` (`type`),
  KEY `campaigns_sort_order` (`sort_order`),
  CONSTRAINT `campaigns_brands_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(160) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(40) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(60) NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `role` VARCHAR(24) NOT NULL DEFAULT 'member',
  `department` VARCHAR(100) NULL,
  `position` VARCHAR(100) NULL,
  `permissions` JSON NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'active',
  `last_login_at` VARCHAR(40) NULL,
  `points` INT NOT NULL DEFAULT 0,
  `total_spent` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL,
  `customer_id` INT NULL,
  `customer_name` VARCHAR(160) NULL,
  `customer_email` VARCHAR(190) NULL,
  `phone` VARCHAR(40) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `postal_code` VARCHAR(20) NULL,
  `country` VARCHAR(60) NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'THB',
  `status` ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(40) NULL,
  `note` TEXT NULL,
  `tracking_no` VARCHAR(80) NULL,
  `carrier` VARCHAR(80) NULL,
  `confirmed_at` VARCHAR(40) NULL,
  `shipped_at` VARCHAR(40) NULL,
  `delivered_at` VARCHAR(40) NULL,
  `coupon_code` VARCHAR(64) NULL,
  `gift_wrap` TINYINT(1) NOT NULL DEFAULT 0,
  `gift_message` VARCHAR(300) NULL,
  `branch_slug` VARCHAR(120) NULL,
  `points_redeemed` INT NOT NULL DEFAULT 0,
  `points_earned` INT NOT NULL DEFAULT 0,
  `channel` VARCHAR(40) NULL DEFAULT 'website',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_no_unique` (`order_no`),
  KEY `orders_customer_id` (`customer_id`),
  KEY `orders_status` (`status`),
  CONSTRAINT `orders_customers_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT NULL,
  `sku` VARCHAR(64) NULL,
  `name` VARCHAR(200) NULL,
  `image` VARCHAR(500) NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 1,
  `wrist_size` VARCHAR(40) NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id` (`order_id`),
  CONSTRAINT `order_items_orders_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `customer_name` VARCHAR(160) NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NULL,
  `status` ENUM('approved','pending') NOT NULL DEFAULT 'approved',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reviews_product_id` (`product_id`),
  CONSTRAINT `reviews_products_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `promotions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `title` VARCHAR(220) NOT NULL,
  `title_th` VARCHAR(220) NULL,
  `title_en` VARCHAR(220) NULL,
  `subtitle` VARCHAR(320) NULL,
  `subtitle_th` VARCHAR(320) NULL,
  `subtitle_en` VARCHAR(320) NULL,
  `banner` VARCHAR(500) NULL,
  `mobile_banner` VARCHAR(500) NULL,
  `channel` VARCHAR(40) NOT NULL DEFAULT 'website',
  `badge` VARCHAR(80) NULL,
  `coupon_code` VARCHAR(64) NULL,
  `discount_label` VARCHAR(80) NULL,
  `link` VARCHAR(500) NULL,
  `target_blank` TINYINT(1) NOT NULL DEFAULT 0,
  `show_on_home` TINYINT(1) NOT NULL DEFAULT 0,
  `home_columns` INT NOT NULL DEFAULT 4,
  `product_ids` JSON NULL,
  `starts_at` VARCHAR(40) NULL,
  `ends_at` VARCHAR(40) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promotions_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `coupons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `title_th` VARCHAR(200) NULL,
  `title_en` VARCHAR(200) NULL,
  `description` VARCHAR(320) NULL,
  `type` VARCHAR(24) NOT NULL DEFAULT 'percent',
  `value` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `min_spend` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `max_discount` DECIMAL(12,2) NULL,
  `brand_slug` VARCHAR(80) NULL,
  `expires_at` VARCHAR(40) NULL,
  `usage_limit` INT NOT NULL DEFAULT 0,
  `used_count` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `branches` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `name_th` VARCHAR(200) NULL,
  `name_en` VARCHAR(200) NULL,
  `zone` VARCHAR(40) NOT NULL DEFAULT 'bangkok',
  `address` TEXT NULL,
  `address_en` TEXT NULL,
  `phone` VARCHAR(60) NULL,
  `hours` VARCHAR(120) NULL,
  `line_url` VARCHAR(300) NULL,
  `map_url` VARCHAR(500) NULL,
  `services` JSON NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branches_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `category` VARCHAR(40) NOT NULL DEFAULT 'legal',
  `title` VARCHAR(220) NOT NULL,
  `title_th` VARCHAR(220) NULL,
  `title_en` VARCHAR(220) NULL,
  `summary` TEXT NULL,
  `summary_en` TEXT NULL,
  `content_th` LONGTEXT NULL,
  `content_en` LONGTEXT NULL,
  `banner` VARCHAR(500) NULL,
  `seo_title` VARCHAR(220) NULL,
  `seo_description` VARCHAR(360) NULL,
  `seo_keywords` VARCHAR(360) NULL,
  `og_image` VARCHAR(500) NULL,
  `canonical_url` VARCHAR(360) NULL,
  `aseo_summary` TEXT NULL,
  `aseo_faqs` JSON NULL,
  `schema_type` VARCHAR(60) NULL DEFAULT 'WebPage',
  `status` VARCHAR(24) NOT NULL DEFAULT 'published',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(80) NULL,
  `customer_name` VARCHAR(160) NULL,
  `customer_contact` VARCHAR(160) NULL,
  `channel` VARCHAR(40) NOT NULL DEFAULT 'webchat',
  `product_slug` VARCHAR(220) NULL,
  `message` TEXT NOT NULL,
  `sender` VARCHAR(24) NOT NULL DEFAULT 'customer',
  `status` VARCHAR(24) NOT NULL DEFAULT 'open',
  `reply` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
