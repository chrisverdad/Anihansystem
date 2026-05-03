import { pool, formatRow, formatRows } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

const WasteCategory = {
  find: async (conditions: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
    let query = 'SELECT * FROM waste_categories WHERE 1=1';
    const params: unknown[] = [];

    if (conditions.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(conditions.is_active ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return formatRows(rows);
  },

  findById: async (id: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM waste_categories WHERE id = ?', [id]);
    return formatRow(rows[0]);
  },

  create: async (categoryData: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO waste_categories (
        name, description, color, icon, is_active
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        categoryData.name,
        categoryData.description,
        categoryData.color,
        categoryData.icon,
        categoryData.is_active !== undefined ? (categoryData.is_active ? 1 : 0) : 1
      ]
    );

    return WasteCategory.findById(result.insertId);
  },

  findByIdAndUpdate: async (
    id: number | string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    const allowedFields = ['name', 'description', 'color', 'icon', 'is_active'];
    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'is_active') {
          setParts.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          setParts.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (setParts.length === 0) {
      return WasteCategory.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE waste_categories SET ${setParts.join(', ')} WHERE id = ?`, values);

    return WasteCategory.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM waste_categories WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM waste_categories');
    return { changes: 0 };
  }
};

export default WasteCategory;
