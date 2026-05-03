import { pool, formatRow, formatRows } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

const WasteType = {
  find: async (conditions: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
    let query = 'SELECT * FROM waste_types WHERE 1=1';
    const params: unknown[] = [];

    if (conditions.category) {
      query += ' AND category = ?';
      params.push(conditions.category);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return formatRows(rows);
  },

  findById: async (id: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM waste_types WHERE id = ?', [id]);
    return formatRow(rows[0]);
  },

  create: async (wasteTypeData: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO waste_types (
        name, description, image_url, category, damage_level
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        wasteTypeData.name,
        wasteTypeData.description,
        wasteTypeData.image_url,
        wasteTypeData.category,
        wasteTypeData.damage_level
      ]
    );

    return WasteType.findById(result.insertId);
  },

  findByIdAndUpdate: async (
    id: number | string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    const allowedFields = ['name', 'description', 'image_url', 'category', 'damage_level'];
    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setParts.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setParts.length === 0) {
      return WasteType.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE waste_types SET ${setParts.join(', ')} WHERE id = ?`, values);

    return WasteType.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM waste_types WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM waste_types');
    return { changes: 0 };
  }
};

export default WasteType;
