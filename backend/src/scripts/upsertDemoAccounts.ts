/**
 * Upserts admin@, vendor@, user@ demo rows (passwords: admin123 / vendor123 / user123).
 * Run: npm run import-demo-accounts
 * Extracts the demo INSERT from database/anihan.sql (single canonical SQL file).
 */
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const { pool, databaseReady } = await import('../config/database.js')

await databaseReady

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlPath = path.join(__dirname, '../../database/anihan.sql')
const raw = fs.readFileSync(sqlPath, 'utf8')
const start = raw.indexOf('INSERT INTO users')
const endMarker = 'approved_at = VALUES(approved_at);'
const end = start === -1 ? -1 : raw.indexOf(endMarker, start)
if (start === -1 || end === -1) {
  throw new Error(`Demo INSERT block not found in ${sqlPath}`)
}
const stmt = raw.slice(start, end + endMarker.length)

await pool.query(stmt)
console.log('✅ Demo accounts upserted (admin / vendor / user).')
process.exit(0)
