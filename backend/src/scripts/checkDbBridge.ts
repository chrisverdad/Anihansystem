/**
 * Verifies MySQL (e.g. XAMPP) connectivity and row counts — same pool as the API.
 * Run: cd backend && npm run check-db
 */
import dotenv from 'dotenv'
import { pool, databaseReady } from '../config/database.js'
import type { RowDataPacket } from 'mysql2'

dotenv.config()

async function main() {
  console.log('Waiting for schema init...')
  await databaseReady

  const conn = await pool.getConnection()
  try {
    await conn.ping()
    console.log('✅ MySQL ping OK')

    const tables = [
      'users',
      'products',
      'waste_categories',
      'waste_types',
      'waste_submissions',
      'source_waste_submissions',
      'inventory_items',
      'orders'
    ] as const

    for (const t of tables) {
      const [rows] = await conn.query<RowDataPacket[]>(`SELECT COUNT(*) AS c FROM \`${t}\``)
      const c = rows[0]?.c ?? 0
      console.log(`   ${t}: ${c} rows`)
    }
  } finally {
    conn.release()
    await pool.end()
  }

  console.log('\n✅ Database bridge check passed. Start API with: npm run dev')
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Database bridge failed:', e instanceof Error ? e.message : e)
  console.error('   Ensure XAMPP MySQL is running and backend/.env matches (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).')
  process.exit(1)
})
