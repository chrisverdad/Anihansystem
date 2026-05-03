import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import './config/database.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import wasteRoutes from './routes/waste.js';
import deliveryRoutes from './routes/deliveries.js';
import { pool, databaseReady } from './config/database.js';
import type { RowDataPacket } from 'mysql2';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(backendRoot, '..', 'public');
app.use('/photos', express.static(path.join(publicPath, 'photos')));
app.use('/images', express.static(path.join(publicPath, 'photos')));
app.use(express.static(publicPath));

const uploadsPath = path.join(backendRoot, 'uploads');
const wastePath = path.join(uploadsPath, 'waste');
const inventoryPath = path.join(uploadsPath, 'inventory');
const usersPath = path.join(uploadsPath, 'users');
[uploadsPath, wastePath, inventoryPath, usersPath].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
// Allow browsers on another origin (e.g. Vite :5173) to display uploaded images without CORS failures
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(uploadsPath)
)

app.get('/health', async (_req, res) => {
  let database = false
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    database = true
  } catch {
    database = false
  }
  res.json({
    success: true,
    message: 'Server is running',
    database,
    hint: database ? 'MySQL bridge OK' : 'Start XAMPP MySQL and check backend/.env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)'
  })
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/deliveries', deliveryRoutes);
app.use('/api/v1/waste', wasteRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err instanceof Error ? err.stack : err);
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : 'Internal server error'
  });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await databaseReady;
  } catch {
    console.warn('Database schema initialization failed; skipping default admin bootstrap.');
    return;
  }
  try {
    const bcrypt = (await import('bcryptjs')).default;

    type DemoRow = {
      email: string;
      pass: string;
      full_name: string;
      role: string;
      phone: string;
      address: string;
      is_active: number;
      vendor_status: string | null;
      business_name: string;
      business_type: string;
      years_in_business: string;
    };

    const demoUsers: DemoRow[] = [
      {
        email: 'admin@anihan.com',
        pass: 'admin123',
        full_name: 'Admin User',
        role: 'admin',
        phone: '+63 912 345 6789',
        address: 'Butuan City, Agusan del Norte',
        is_active: 1,
        vendor_status: null,
        business_name: '',
        business_type: '',
        years_in_business: ''
      },
      {
        email: 'vendor@anihan.com',
        pass: 'vendor123',
        full_name: 'Maria Santos',
        role: 'vendor',
        phone: '+63 912 345 6787',
        address: 'Public Market, Butuan City',
        is_active: 1,
        vendor_status: 'approved',
        business_name: 'Santos Farm Produce',
        business_type: 'Farm',
        years_in_business: '5'
      },
      {
        email: 'user@anihan.com',
        pass: 'user123',
        full_name: 'Pedro Garcia',
        role: 'user',
        phone: '+63 912 345 6786',
        address: 'Residential Area, Butuan City',
        is_active: 1,
        vendor_status: null,
        business_name: '',
        business_type: '',
        years_in_business: ''
      }
    ];

    for (const u of demoUsers) {
      const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length > 0) continue;

      const hash = bcrypt.hashSync(u.pass, 10);
      await pool.execute(
        `INSERT INTO users (
          email, password, full_name, role, phone, address, profile_photo,
          is_active, vendor_status, business_name, business_type,
          business_license, years_in_business, approval_notes, approved_by, approved_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.email,
          hash,
          u.full_name,
          u.role,
          u.phone,
          u.address,
          '',
          u.is_active,
          u.vendor_status,
          u.business_name,
          u.business_type,
          '',
          u.years_in_business,
          '',
          '',
          null
        ]
      );
      console.log(`✅ Demo account created: ${u.email} / ${u.pass}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn('Could not ensure demo accounts:', msg);
  }
});
