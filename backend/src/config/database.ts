/**
 * MySQL connection for AniHan (XAMPP / MariaDB / standalone MySQL).
 * Configure via backend/.env: DB_HOST, DB_PORT (default 3306), DB_USER, DB_PASSWORD, DB_NAME.
 * The pool is the single bridge used by all models and matches phpMyAdmin database `anihan`.
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import type { RowDataPacket } from 'mysql2';

dotenv.config();

const dbConfig: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'anihan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const createDatabaseIfNotExists = async (): Promise<void> => {
  try {
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await tempConnection.end();
    console.log(`✅ Database '${dbConfig.database}' ready`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error creating database:', msg);
    throw error;
  }
};

const pool = mysql.createPool(dbConfig);

(async () => {
  try {
    await createDatabaseIfNotExists();
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    connection.release();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Database connection error:', msg);
    console.error('Please ensure:');
    console.error('1. XAMPP MySQL is running');
    console.error('2. MySQL credentials in .env are correct');
    console.error('3. MySQL service is accessible');
  }
})();

const initializeDatabase = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // users.password stores bcrypt hashes; self-service change via PUT /api/v1/auth/change-password (JWT).
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
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
        INDEX idx_products_public_catalog (is_public, is_available, deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      const dbName = dbConfig.database || 'anihan';
      const [colRows] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'source_waste_submission_id'`,
        [dbName]
      );
      if (!colRows?.length) {
        await connection.query(
          `ALTER TABLE products ADD COLUMN source_waste_submission_id INT DEFAULT NULL,
           ADD INDEX idx_products_source_sub (source_waste_submission_id)`
        );
      }
    } catch (migrateErr) {
      console.warn('products.source_waste_submission_id migration:', migrateErr);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [colVendor] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'vendor_id'`,
        [dbName]
      );
      if (!colVendor?.length) {
        await connection.query(
          `ALTER TABLE products ADD COLUMN vendor_id INT DEFAULT NULL,
           ADD INDEX idx_products_vendor_id (vendor_id)`
        );
      }
    } catch (migrateVendorCol) {
      console.warn('products.vendor_id column migration:', migrateVendorCol);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [fkVendor] = await connection.query<RowDataPacket[]>(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'
         AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'fk_products_vendor'`,
        [dbName]
      );
      if (!fkVendor?.length) {
        await connection.query(
          `ALTER TABLE products ADD CONSTRAINT fk_products_vendor
           FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL`
        );
      }
    } catch (fkVendorErr) {
      console.warn('products → users vendor FK (optional):', fkVendorErr);
    }

    try {
      await connection.query(
        `UPDATE products p
         INNER JOIN source_waste_submissions s ON p.source_waste_submission_id = s.id
         SET p.vendor_id = s.vendor_id
         WHERE p.vendor_id IS NULL AND s.vendor_id IS NOT NULL`
      );
    } catch (backfillErr) {
      console.warn('products.vendor_id backfill:', backfillErr);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [colDel] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'deleted_at'`,
        [dbName]
      );
      if (!colDel?.length) {
        await connection.query(
          `ALTER TABLE products ADD COLUMN deleted_at DATETIME DEFAULT NULL,
           ADD INDEX idx_products_deleted_at (deleted_at)`
        );
      }
    } catch (migrateDel) {
      console.warn('products.deleted_at column migration:', migrateDel);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [colPub] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_public'`,
        [dbName]
      );
      if (!colPub?.length) {
        await connection.query(
          `ALTER TABLE products ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 1`
        );
      }
    } catch (migratePub) {
      console.warn('products.is_public column migration:', migratePub);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [idxPub] = await connection.query<RowDataPacket[]>(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_public_catalog'`,
        [dbName]
      );
      if (!idxPub?.length) {
        await connection.query(
          `CREATE INDEX idx_products_public_catalog ON products (is_public, is_available, deleted_at)`
        );
      }
    } catch (idxPubErr) {
      console.warn('products idx_products_public_catalog:', idxPubErr);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS waste_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const defaultWasteCategories: [string, string, string, string][] = [
      ['Fruits', 'Fresh and processed fruits', '#f59e0b', 'SunIcon'],
      ['Vegetables', 'Fresh and processed vegetables', '#10b981', 'SunIcon'],
      ['Grains', 'Rice, wheat, and other grains', '#8b5cf6', 'CubeIcon']
    ];
    for (const [name, description, color, icon] of defaultWasteCategories) {
      await connection.query(
        `INSERT INTO waste_categories (name, description, color, icon, is_active)
         SELECT ?, ?, ?, ?, 1
         WHERE NOT EXISTS (SELECT 1 FROM waste_categories c WHERE c.name = ? LIMIT 1)`,
        [name, description, color, icon, name]
      );
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS waste_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        category ENUM('fruit', 'vegetable', 'grain', 'other') NOT NULL,
        damage_level ENUM('slight', 'moderate', 'severe') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS waste_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        waste_type_id INT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 1),
        unit ENUM('kg', 'pieces', 'baskets', 'bags', 'boxes', 'liters') NOT NULL,
        description TEXT DEFAULT '',
        status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME DEFAULT NULL,
        title VARCHAR(255) DEFAULT '',
        category VARCHAR(100) DEFAULT '',
        \`condition\` VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (waste_type_id) REFERENCES waste_types(id) ON DELETE CASCADE,
        INDEX idx_waste_submissions_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS source_waste_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 1),
        unit ENUM('kg', 'pieces', 'baskets', 'bags', 'boxes', 'liters') NOT NULL,
        \`condition\` ENUM('fresh', 'slightly_damaged', 'overripe', 'bruised', 'expired', 'other') NOT NULL,
        location VARCHAR(255) NOT NULL,
        estimated_value DECIMAL(10, 2) DEFAULT 0,
        image_url VARCHAR(500) DEFAULT '',
        status ENUM('pending', 'approved', 'rejected', 'collected', 'processed') DEFAULT 'approved',
        admin_notes TEXT DEFAULT '',
        rejection_reason TEXT DEFAULT '',
        actual_value DECIMAL(10, 2) DEFAULT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE CASCADE,
        INDEX idx_source_waste_submissions_vendor_id (vendor_id),
        INDEX idx_source_waste_submissions_submitted_at (submitted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      const dbNamePick = dbConfig.database || 'anihan';
      const [pickupCol] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'source_waste_submissions' AND COLUMN_NAME = 'pickup_date'`,
        [dbNamePick]
      );
      if (pickupCol?.length) {
        await connection.query(`ALTER TABLE source_waste_submissions DROP COLUMN pickup_date`);
      }
    } catch (pickupDropErr) {
      console.warn('source_waste_submissions DROP pickup_date migration:', pickupDropErr);
    }

    try {
      const dbNameR = dbConfig.database || 'anihan';
      const [ixSub] = await connection.query<RowDataPacket[]>(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'source_waste_submissions'
           AND INDEX_NAME = 'idx_source_waste_submissions_submitted_at' LIMIT 1`,
        [dbNameR]
      );
      if (!ixSub?.length) {
        await connection.query(
          `ALTER TABLE source_waste_submissions ADD INDEX idx_source_waste_submissions_submitted_at (submitted_at)`
        );
      }
    } catch (repIdxErr) {
      console.warn('source_waste_submissions submitted_at index migration:', repIdxErr);
    }

    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      const dbName = dbConfig.database || 'anihan';
      const [invRef] = await connection.query<RowDataPacket[]>(
        `SELECT rc.CONSTRAINT_NAME, rc.DELETE_RULE
         FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
         INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
           ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
           AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
         WHERE rc.CONSTRAINT_SCHEMA = ? AND kcu.TABLE_NAME = 'inventory_items'
           AND kcu.COLUMN_NAME = 'source_waste_submission_id'
           AND kcu.REFERENCED_TABLE_NAME = 'source_waste_submissions'`,
        [dbName]
      );
      const invRow = invRef?.[0] as { CONSTRAINT_NAME?: string; DELETE_RULE?: string } | undefined;
      if (invRow?.CONSTRAINT_NAME && String(invRow.DELETE_RULE).toUpperCase() !== 'CASCADE') {
        const cname = String(invRow.CONSTRAINT_NAME).replace(/`/g, '');
        await connection.query(`ALTER TABLE inventory_items DROP FOREIGN KEY \`${cname}\``);
        await connection.query(
          `ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_source_sub_fk
           FOREIGN KEY (source_waste_submission_id) REFERENCES source_waste_submissions(id) ON DELETE CASCADE`
        );
      }
    } catch (invFkErr) {
      console.warn('inventory_items → source_waste_submissions FK migration:', invFkErr);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [fkProd] = await connection.query<RowDataPacket[]>(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products'
         AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'fk_products_source_waste_submission'`,
        [dbName]
      );
      if (!fkProd?.length) {
        await connection.query(
          `ALTER TABLE products ADD CONSTRAINT fk_products_source_waste_submission
           FOREIGN KEY (source_waste_submission_id) REFERENCES source_waste_submissions(id) ON DELETE CASCADE`
        );
      }
    } catch (fkErr) {
      console.warn('products → source_waste_submissions FK (optional):', fkErr);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL CHECK (quantity >= 1),
        total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
        status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        payment_method ENUM('cash', 'gcash') NOT NULL,
        payment_reference VARCHAR(255) DEFAULT '',
        delivery_status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
        delivery_address TEXT NOT NULL,
        delivery_notes TEXT DEFAULT '',
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      const dbNameO = dbConfig.database || 'anihan';
      const [ixOrd] = await connection.query<RowDataPacket[]>(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders'
           AND INDEX_NAME = 'idx_orders_order_date' LIMIT 1`,
        [dbNameO]
      );
      if (!ixOrd?.length) {
        await connection.query(`ALTER TABLE orders ADD INDEX idx_orders_order_date (order_date)`);
      }
    } catch (ordIdxErr) {
      console.warn('orders order_date index migration:', ordIdxErr);
    }

    await connection.query(`
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
        INDEX idx_deliveries_order_id (order_id),
        INDEX idx_deliveries_vendor_id (vendor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    try {
      const dbName = dbConfig.database || 'anihan';
      const [colV] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deliveries' AND COLUMN_NAME = 'vendor_id'`,
        [dbName]
      );
      if (!colV?.length) {
        await connection.query(
          `ALTER TABLE deliveries ADD COLUMN vendor_id INT DEFAULT NULL,
           ADD INDEX idx_deliveries_vendor_id (vendor_id)`
        );
      }
    } catch (e) {
      console.warn('deliveries.vendor_id migration:', e);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [colA] = await connection.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deliveries' AND COLUMN_NAME = 'admin_notes'`,
        [dbName]
      );
      if (!colA?.length) {
        await connection.query(`ALTER TABLE deliveries ADD COLUMN admin_notes TEXT DEFAULT ''`);
      }
    } catch (e) {
      console.warn('deliveries.admin_notes migration:', e);
    }

    try {
      const dbName = dbConfig.database || 'anihan';
      const [fkDv] = await connection.query<RowDataPacket[]>(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'deliveries'
         AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'fk_deliveries_vendor'`,
        [dbName]
      );
      if (!fkDv?.length) {
        await connection.query(
          `ALTER TABLE deliveries ADD CONSTRAINT fk_deliveries_vendor
           FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL`
        );
      }
    } catch (e) {
      console.warn('deliveries → users vendor FK (optional):', e);
    }

    try {
      await connection.query(
        `UPDATE deliveries d
         INNER JOIN orders o ON d.order_id = o.id
         INNER JOIN products p ON p.id = o.product_id
         SET d.vendor_id = p.vendor_id
         WHERE d.vendor_id IS NULL AND p.vendor_id IS NOT NULL`
      );
    } catch (e) {
      console.warn('deliveries.vendor_id backfill:', e);
    }

    try {
      await connection.query(
        `INSERT INTO deliveries (order_id, vendor_id, status, notes, admin_notes)
         SELECT o.id, p.vendor_id, o.delivery_status, '', ''
         FROM orders o
         LEFT JOIN products p ON p.id = o.product_id
         WHERE NOT EXISTS (SELECT 1 FROM deliveries d WHERE d.order_id = o.id)`
      );
    } catch (e) {
      console.warn('deliveries backfill from orders:', e);
    }

    connection.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export const databaseReady = initializeDatabase();
databaseReady.catch((err) => console.error('❌ Error initializing database:', err));

export function formatRow(
  row: RowDataPacket | Record<string, unknown> | undefined | null
): Record<string, unknown> | null {
  if (!row) return null;
  const formatted: Record<string, unknown> = { ...row };
  if (formatted.is_active !== undefined) formatted.is_active = Boolean(formatted.is_active);
  if (formatted.is_available !== undefined) formatted.is_available = Boolean(formatted.is_available);
  if (formatted.quantity_history) {
    try {
      formatted.quantity_history =
        typeof formatted.quantity_history === 'string'
          ? JSON.parse(formatted.quantity_history as string)
          : formatted.quantity_history;
    } catch {
      formatted.quantity_history = [];
    }
  }
  return formatted;
}

export function formatRows(rows: RowDataPacket[]): Record<string, unknown>[] {
  return rows.map((r) => formatRow(r)!);
}

export { pool };
export default pool;
