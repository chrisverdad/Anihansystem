-- AniHan — single canonical database file (schema + demo users + idempotent alignment).
-- Database: anihan (XAMPP / MariaDB / MySQL — same schema as backend/src/config/database.ts)
--
-- XAMPP (typical):
--   1. Start Apache + MySQL from XAMPP Control Panel.
--   2. Open http://localhost/phpmyadmin → create database `anihan` (optional; this file creates it).
--   3. Import: select `anihan` → Import → choose this file → Go.
--   4. Backend .env (see backend/.env.example): DB_HOST=localhost DB_USER=root DB_PASSWORD= (empty unless set) DB_NAME=anihan
--
-- IMPORT (choose one):
--   • From backend folder (uses .env DB_*):  npm run import:sql
--   • phpMyAdmin: Import > this file > Go
--   • CLI:  mysql -u root -p < backend/database/anihan.sql
--
-- Schema matches backend/src/config/database.ts (CREATE TABLE IF NOT EXISTS + migrations on API start).
-- Admin UI: a single screen at /admin/reports covers reports + analytics (exports, charts, metrics). /admin/analytics redirects there.
-- source_waste_submissions has no pickup_date (removed); existing databases: restart API to DROP COLUMN pickup_date.
-- POST /api/v1/waste/source-submissions creates inventory_items + products linked by
-- source_waste_submission_id and sets products.vendor_id. Trailing section below cleans legacy demo rows and normalizes
-- source submission status (no approval workflow). Extra FK/column fixes run when you start the API.
--
-- For vendor source waste: ensure users (vendor) and waste_categories exist; three default categories
-- (Fruits, Vegetables, Grains) are inserted after CREATE waste_categories; demo logins are inserted below.
--
-- Tables created (in order for foreign keys):
--   1. users
--   2. products
--   3. waste_categories
--   4. waste_types
--   5. waste_submissions
--   6. source_waste_submissions
--   7. inventory_items
--   8. orders
--   9. deliveries
--

CREATE DATABASE IF NOT EXISTS anihan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE anihan;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- bcrypt hash (never store plain text). Users/vendors change password via PUT /api/v1/auth/change-password (JWT).
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('vendor', 'admin', 'user') NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    address TEXT DEFAULT '',
    profile_photo VARCHAR(500) DEFAULT '',
    is_active TINYINT(1) DEFAULT 1,
    vendor_status ENUM('pending', 'approved', 'rejected') DEFAULT NULL,
    business_name VARCHAR(255) DEFAULT '',
    business_type VARCHAR(255) DEFAULT '',
    business_license VARCHAR(500) DEFAULT '',
    years_in_business VARCHAR(50) DEFAULT '',
    approval_notes TEXT DEFAULT '',
    approved_by VARCHAR(255) DEFAULT '',
    approved_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
-- products.vendor_id identifies the vendor for admin/catalog display for items created from source waste.
-- is_public: when 1, product may appear on the unauthenticated landing page (GET /api/v1/products?public=1).
--    Public listing also requires deleted_at IS NULL, is_available = 1.
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category ENUM('compost', 'fertilizer', 'preserved_food', 'processed_food', 'other') NOT NULL,
    image_url VARCHAR(500) DEFAULT '',
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit ENUM('kg', 'bags', 'bottles', 'pieces', 'jars', 'boxes') NOT NULL,
    is_available TINYINT(1) DEFAULT 1,
    is_public TINYINT(1) NOT NULL DEFAULT 1,
    source_waste_submission_id INT DEFAULT NULL,
    vendor_id INT DEFAULT NULL,
    deleted_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_source_sub (source_waste_submission_id),
    INDEX idx_products_vendor_id (vendor_id),
    INDEX idx_products_deleted_at (deleted_at),
    INDEX idx_products_public_catalog (is_public, is_available, deleted_at),
    CONSTRAINT fk_products_vendor FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Waste Categories table
CREATE TABLE IF NOT EXISTS waste_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    color VARCHAR(50) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default waste categories (vendor source submissions + GET /waste/categories). Idempotent by name.
INSERT INTO waste_categories (name, description, color, icon, is_active)
SELECT 'Fruits', 'Fresh and processed fruits', '#f59e0b', 'SunIcon', 1
WHERE NOT EXISTS (SELECT 1 FROM waste_categories c WHERE c.name = 'Fruits' LIMIT 1);
INSERT INTO waste_categories (name, description, color, icon, is_active)
SELECT 'Vegetables', 'Fresh and processed vegetables', '#10b981', 'SunIcon', 1
WHERE NOT EXISTS (SELECT 1 FROM waste_categories c WHERE c.name = 'Vegetables' LIMIT 1);
INSERT INTO waste_categories (name, description, color, icon, is_active)
SELECT 'Grains', 'Rice, wheat, and other grains', '#8b5cf6', 'CubeIcon', 1
WHERE NOT EXISTS (SELECT 1 FROM waste_categories c WHERE c.name = 'Grains' LIMIT 1);

-- Waste Types table (UI guide cards: image_url may be full HTTPS demo art or /uploads/* from API)
CREATE TABLE IF NOT EXISTS waste_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('fruit', 'vegetable', 'grain', 'other') NOT NULL,
    damage_level ENUM('slight', 'moderate', 'severe') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Waste Submissions table
CREATE TABLE IF NOT EXISTS waste_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    waste_type_id INT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 1),
    unit ENUM('kg', 'pieces', 'baskets', 'bags', 'boxes', 'liters') NOT NULL,
    description TEXT DEFAULT '',
    status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
    -- DATETIME: 'YYYY-MM-DD HH:MM:SS'; API normalizes ISO-8601 before INSERT.
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME DEFAULT NULL,
    title VARCHAR(255) DEFAULT '',
    category VARCHAR(100) DEFAULT '',
    `condition` VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (waste_type_id) REFERENCES waste_types(id) ON DELETE CASCADE,
    INDEX idx_waste_submissions_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Source Waste Submissions table (vendor-submitted waste; used at /vendor/source-submissions)
-- Ensure users and waste_categories exist first (foreign keys).
-- Reporting (admin/vendor Reports): daily trend charts bucket by submitted_at; idx below speeds range scans.
CREATE TABLE IF NOT EXISTS source_waste_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 1),
    unit ENUM('kg', 'pieces', 'baskets', 'bags', 'boxes', 'liters') NOT NULL,
    `condition` ENUM('fresh', 'slightly_damaged', 'overripe', 'bruised', 'expired', 'other') NOT NULL,
    location VARCHAR(255) NOT NULL,
    estimated_value DECIMAL(10, 2) DEFAULT 0,
    -- Relative paths e.g. /uploads/waste/<file> (API static); empty if no photo. Frontend uses API origin + path.
    image_url VARCHAR(500) DEFAULT '',
    status ENUM('pending', 'approved', 'rejected', 'collected', 'processed') DEFAULT 'approved',
    admin_notes TEXT DEFAULT '',
    rejection_reason TEXT DEFAULT '',
    actual_value DECIMAL(10, 2) DEFAULT NULL,
    -- DATETIME: use 'YYYY-MM-DD HH:MM:SS'. The API maps ISO-8601 to this form before INSERT.
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE CASCADE,
    INDEX idx_source_waste_submissions_vendor_id (vendor_id),
    INDEX idx_source_waste_submissions_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: verify table and see data (run in MySQL/phpMyAdmin):
-- SELECT * FROM source_waste_submissions ORDER BY id DESC LIMIT 10;

-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('compost', 'fertilizer', 'preserved_food', 'processed_food', 'other') NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit ENUM('kg', 'bags', 'bottles', 'pieces', 'jars', 'boxes') NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
    total_value DECIMAL(10, 2) NOT NULL CHECK (total_value >= 0),
    source_waste_submission_id INT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT '',
    is_available TINYINT(1) DEFAULT 1,
    quantity_history JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_waste_submission_id) REFERENCES source_waste_submissions(id) ON DELETE CASCADE,
    INDEX idx_inventory_items_vendor_id (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- products → source_waste_submissions FK: added on API startup (database.ts) if missing.

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 1),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'gcash', 'bank') NOT NULL,
    payment_reference VARCHAR(255) DEFAULT '',
    -- Fulfillment lifecycle; vendor may update via PUT /orders/:id (JWT). deliveries.status stays in sync when either side changes.
    delivery_status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT DEFAULT '',
    -- DATETIME columns: use 'YYYY-MM-DD HH:MM:SS'; API normalizes ISO-8601.
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATETIME DEFAULT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_product_id (product_id),
    INDEX idx_orders_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deliveries table (vendor_id = seller fulfilling the order; admin_notes visible to admin UI only)
-- delivery_person / delivery_vehicle / notes: entered by vendor in /vendor/deliveries; API exposes as order.delivery_info for buyers (/user/orders).
CREATE TABLE IF NOT EXISTS deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    vendor_id INT DEFAULT NULL,
    delivery_person VARCHAR(255) DEFAULT '',
    delivery_vehicle VARCHAR(255) DEFAULT '',
    pickup_time DATETIME DEFAULT NULL,
    delivery_time DATETIME DEFAULT NULL,
    status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
    notes TEXT DEFAULT '',
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_deliveries_vendor_id (vendor_id),
    INDEX idx_deliveries_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Demo accounts (admin / vendor / user) — bcrypt: admin123, vendor123, user123
-- Safe to re-run: ON DUPLICATE KEY UPDATE. npm run import-demo-accounts reads this block.
-- ---------------------------------------------------------------------------
INSERT INTO users (
  email, password, full_name, role, phone, address, profile_photo,
  is_active, vendor_status, business_name, business_type,
  business_license, years_in_business, approval_notes, approved_by, approved_at
) VALUES
(
  'admin@anihan.com',
  '$2a$10$jLerypz63fjr869ofil0P.m0w/idr3iFx/20S0lVLMVlXoOYd0Kx.',
  'Admin User',
  'admin',
  '+63 912 345 6789',
  'Butuan City, Agusan del Norte',
  '',
  1,
  NULL,
  '',
  '',
  '',
  '',
  '',
  '',
  NULL
),
(
  'vendor@anihan.com',
  '$2a$10$YuWSrEncOU68.9TfuzKKW.vgnkO6uP0FqMtn73zt2HkP2qIB4LvH6',
  'Maria Santos',
  'vendor',
  '+63 912 345 6787',
  'Public Market, Butuan City',
  '',
  1,
  'approved',
  'Santos Farm Produce',
  'Farm',
  '',
  '5',
  '',
  '',
  NULL
),
(
  'user@anihan.com',
  '$2a$10$My/d/Gee2FX0Ux9YFjte3.qqsI5TKHzQRJVNonXbnidgaXhUxMyrC',
  'Pedro Garcia',
  'user',
  '+63 912 345 6786',
  'Residential Area, Butuan City',
  '',
  1,
  NULL,
  '',
  '',
  '',
  '',
  '',
  '',
  NULL
)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  full_name = VALUES(full_name),
  role = VALUES(role),
  phone = VALUES(phone),
  address = VALUES(address),
  is_active = VALUES(is_active),
  vendor_status = VALUES(vendor_status),
  business_name = VALUES(business_name),
  business_type = VALUES(business_type),
  years_in_business = VALUES(years_in_business),
  profile_photo = VALUES(profile_photo),
  approval_notes = VALUES(approval_notes),
  approved_by = VALUES(approved_by),
  approved_at = VALUES(approved_at);

-- ---------------------------------------------------------------------------
-- Post-import alignment (idempotent; safe to re-run; mysql2-compatible — no DELIMITER)
-- Trend charts use submitted_at / order_date; idx_source_waste_submissions_submitted_at and
-- idx_orders_order_date are on new schemas below — existing DBs get them when the API runs database.ts.
-- ---------------------------------------------------------------------------

DELETE FROM inventory_items
WHERE product_name IN (
  'Tomato Fertilizer',
  'Mango Jam',
  'Vegetable Compost'
);

DELETE FROM waste_types
WHERE name IN (
  'Dairy Products',
  'Grains',
  'Mango Jam',
  'Meat Products',
  'Tomato Fertilizer',
  'Vegetable Compost'
);

UPDATE source_waste_submissions
SET status = 'approved', rejection_reason = ''
WHERE status IN ('pending', 'rejected');

-- Backfill products.vendor_id requires the column (added by fresh CREATE above, or by API startup migration in database.ts).
ALTER TABLE source_waste_submissions
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'collected', 'processed') NOT NULL DEFAULT 'approved';

-- Backfill vendor on products created from source waste (run after vendor_id column exists)
UPDATE products p
INNER JOIN source_waste_submissions s ON p.source_waste_submission_id = s.id
SET p.vendor_id = s.vendor_id
WHERE p.vendor_id IS NULL;

-- Legacy demo paths → Wikimedia Commons thumbnails (CC-licensed). No-op if already migrated.
UPDATE waste_types SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bananas_white_background_DS.jpg/640px-Bananas_white_background_DS.jpg' WHERE image_url IN ('/images/overripe-bananas.jpg', '/photos/overripe banana.jpg');
UPDATE waste_types SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/640px-Bright_red_tomato_and_cross_section02.jpg' WHERE image_url IN ('/images/bruised-tomatoes.jpg', '/photos/bruised tomatos.jpg');
UPDATE waste_types SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mangoes_whole_and_halved.jpg/640px-Mangoes_whole_and_halved.jpg' WHERE image_url IN ('/images/damaged-mangoes.jpg', '/photos/damage mangoes.jpg');
UPDATE waste_types SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Lettuce_in_supermarket.jpg/640px-Lettuce_in_supermarket.jpg' WHERE image_url IN ('/images/wilted-lettuce.jpg', '/photos/wilted lettuce.jpg');
UPDATE waste_types SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Apple_Granny_Smith.jpg/640px-Apple_Granny_Smith.jpg' WHERE image_url IN ('/images/damaged-apples.jpg', '/photos/damage apples.webp');
UPDATE waste_types SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Papaya_cross_section_B.jpg/640px-Papaya_cross_section_B.jpg' WHERE image_url IN ('/images/overripe-papayas.jpg', '/photos/overripe papaya.jpg');
UPDATE products SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Compost.jpg/640px-Compost.jpg' WHERE image_url IN ('/photos/banana compost.jpg', '/images/banana-compost.jpg');
UPDATE source_waste_submissions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bananas_white_background_DS.jpg/640px-Bananas_white_background_DS.jpg' WHERE image_url = '/images/overripe-bananas.jpg';
UPDATE source_waste_submissions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/640px-Bright_red_tomato_and_cross_section02.jpg' WHERE image_url = '/images/bruised-tomatoes.jpg';
UPDATE source_waste_submissions SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Mangoes_whole_and_halved.jpg/640px-Mangoes_whole_and_halved.jpg' WHERE image_url = '/images/damaged-mangoes.jpg';
UPDATE inventory_items SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Compost.jpg/640px-Compost.jpg' WHERE image_url IN ('/photos/banana compost.jpg', '/placeholder-image.svg') AND product_name LIKE '%Banana%Compost%';
