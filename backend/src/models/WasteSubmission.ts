import { pool, formatRow } from '../config/database.js';
import { toMysqlDateTime, toMysqlDateTimeOrNull, valueForMysqlDateTimeColumn } from '../utils/mysqlDateTime.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

function buildSubmission(row: RowDataPacket): Record<string, unknown> {
  const submission = formatRow({
    id: row.id,
    user_id: row.user_id,
    waste_type_id: row.waste_type_id,
    quantity: row.quantity,
    unit: row.unit,
    description: row.description,
    status: row.status,
    submitted_at: row.submitted_at,
    processed_at: row.processed_at,
    title: row.title,
    category: row.category,
    condition: row.condition,
    created_at: row.created_at,
    updated_at: row.updated_at
  }) as Record<string, unknown>;

  submission.user_id = {
    id: row.user_id,
    full_name: row.user_full_name,
    email: row.user_email,
    phone: row.user_phone,
    address: row.user_address
  };

  submission.waste_type_id = {
    id: row.waste_type_id,
    name: row.waste_type_name,
    description: row.waste_type_description,
    image_url: row.waste_type_image_url,
    category: row.waste_type_category,
    damage_level: row.waste_type_damage_level
  };

  return submission;
}

const WasteSubmission = {
  find: async (conditions: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
    let query = `
      SELECT ws.*,
             u.full_name as user_full_name, u.email as user_email,
             u.phone as user_phone, u.address as user_address,
             wt.name as waste_type_name, wt.description as waste_type_description,
             wt.image_url as waste_type_image_url, wt.category as waste_type_category,
             wt.damage_level as waste_type_damage_level
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.id
      LEFT JOIN waste_types wt ON ws.waste_type_id = wt.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (conditions.user_id) {
      query += ' AND ws.user_id = ?';
      params.push(conditions.user_id);
    }
    if (conditions.status) {
      query += ' AND ws.status = ?';
      params.push(conditions.status);
    }

    query += ' ORDER BY ws.created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return rows.map((row) => buildSubmission(row));
  },

  findById: async (id: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT ws.*,
             u.full_name as user_full_name, u.email as user_email,
             u.phone as user_phone, u.address as user_address,
             wt.name as waste_type_name, wt.description as waste_type_description,
             wt.image_url as waste_type_image_url, wt.category as waste_type_category,
             wt.damage_level as waste_type_damage_level
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.id
      LEFT JOIN waste_types wt ON ws.waste_type_id = wt.id
      WHERE ws.id = ?
    `,
      [id]
    );

    if (rows.length === 0) return null;
    return buildSubmission(rows[0]);
  },

  create: async (submissionData: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO waste_submissions (
        user_id, waste_type_id, quantity, unit, description,
        status, submitted_at, processed_at, title, category, \`condition\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        submissionData.user_id,
        submissionData.waste_type_id,
        submissionData.quantity,
        submissionData.unit,
        submissionData.description || '',
        submissionData.status || 'pending',
        submissionData.submitted_at != null && submissionData.submitted_at !== ''
          ? toMysqlDateTime(submissionData.submitted_at as string | number | Date)
          : toMysqlDateTime(new Date()),
        toMysqlDateTimeOrNull(submissionData.processed_at),
        submissionData.title || '',
        submissionData.category || '',
        submissionData.condition || ''
      ]
    );

    return WasteSubmission.findById(result.insertId);
  },

  findByIdAndUpdate: async (
    id: number | string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    const allowedFields = [
      'quantity',
      'unit',
      'description',
      'status',
      'processed_at',
      'title',
      'category',
      'condition'
    ];
    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        const columnName = key === 'condition' ? '`condition`' : key;
        setParts.push(`${columnName} = ?`);
        values.push(valueForMysqlDateTimeColumn(key, value));
      }
    }

    if (setParts.length === 0) {
      return WasteSubmission.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE waste_submissions SET ${setParts.join(', ')} WHERE id = ?`, values);

    return WasteSubmission.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM waste_submissions WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM waste_submissions');
    return { changes: 0 };
  }
};

export default WasteSubmission;
