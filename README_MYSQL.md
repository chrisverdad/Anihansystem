# AniHan System - MySQL/XAMPP Integration ✅

## 🎉 Migration Complete!

The system has been **completely migrated from SQLite to MySQL** using XAMPP!

## ✅ What's Done

- ✅ Single MySQL bundle `backend/database/anihan.sql` (schema + demo users + idempotent upgrades); `cd backend && npm run import:sql` or phpMyAdmin; aligns with `backend/src/config/database.ts`
- ✅ Updated all backend code to use MySQL
- ✅ All models converted to async/await
- ✅ All routes updated
- ✅ Seed script updated
- ✅ Backend running on port 3000
- ✅ Frontend running on port 5173

## 🚀 Quick Start

### 1. Start XAMPP MySQL
- Open XAMPP Control Panel
- Click "Start" for MySQL

### 2. Database Auto-Creates!
The backend automatically creates the `anihan` database and tables!

### 3. Seed Database (required for demo login)
Run once to create demo accounts and sample data:
```powershell
cd backend
npm run seed
```

### 4. Production build (optional)
From project root:
```bash
npm run build:all
```
This runs `backend` TypeScript compile and `vite build` for the frontend.

### 5. Verify MySQL bridge (optional)
With XAMPP MySQL running:
```bash
npm run check:db
```
Prints table row counts and confirms the API can reach the same database as `backend/.env`.

### 6. Start backend and frontend
- Backend: `cd backend` then `npm run build && npm start` (or `npm run dev` while developing)
- Frontend: from project root `npm run dev`, or `npm run preview` after a build
- Optional: copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` if the API is not at `http://localhost:3000/api/v1`

### 7. Access system
- **Backend**: `http://localhost:3000/health` — JSON includes `"database": true` when MySQL is reachable
- **Frontend**: `http://localhost:5173` (dev) or static files from `dist/`
- **Demo login** (after `npm run seed`): admin@anihan.com / admin123

## 📊 Database Structure

**Database Name**: `anihan`

**Tables** (creation order in schema):
1. users  
2. products  
3. waste_categories  
4. waste_types  
5. waste_submissions  
6. source_waste_submissions  
7. inventory_items  
8. orders  
9. deliveries  

## 🔧 Configuration

**Backend (MySQL / XAMPP)**: `backend/.env` — copy from `backend/.env.example`.
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=anihan
```

**Frontend (API URL)**: optional `/.env.local` — copy from `/.env.example` (`VITE_API_BASE_URL` defaults to `http://localhost:3000/api/v1` in code if unset).

**Note**: If your MySQL has a password, set `DB_PASSWORD` in `backend/.env`.

## ✅ All Files Aligned

- ✅ Database config: MySQL pool (`backend/src/config/database.ts`) → XAMPP `localhost:3306`
- ✅ All models: async MySQL (`mysql2`)
- ✅ API routes: Express + MySQL
- ✅ Seed / demo scripts: `npm run seed`, `npm run import-demo-accounts`
- ✅ Bridge check: `npm run check:db` (root) / `npm run check-db` (backend)
- ✅ Builds: `npm run build:all` (backend `tsc` + frontend Vite)
- ✅ Frontend: `VITE_API_BASE_URL` → same API that uses `DB_*`

## 🎯 System Status

- ✅ **Backend**: Running
- ✅ **Frontend**: Running
- ✅ **MySQL**: Ready
- ✅ **All Code**: Aligned

**Everything is ready to use!** 🎉
