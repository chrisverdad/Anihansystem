/**
 * Import database/anihan.sql (sole SQL file: schema + demo + alignment) using DB_* from .env.
 * Run: cd backend && npm run import:sql
 *
 * Uses the same host/user/password as the API; creates DB `anihan` and tables if missing.
 * Safe alongside `npm run dev` after import completes (restart dev server if needed).
 */
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlPath = path.join(__dirname, '../../database/anihan.sql')

async function main() {
  if (!fs.existsSync(sqlPath)) {
    console.error('Missing file:', sqlPath)
    process.exit(1)
  }
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ?? '',
    multipleStatements: true
  })
  try {
    await conn.query(sql)
    console.log('✅ Imported', path.relative(process.cwd(), sqlPath))
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
