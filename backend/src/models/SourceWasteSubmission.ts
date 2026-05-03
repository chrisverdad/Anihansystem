import { pool, formatRow } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { toMysqlDateTime, toMysqlDateTimeOrNull, valueForMysqlDateTimeColumn } from '../utils/mysqlDateTime.js';

function buildSubmission(row: RowDataPacket): Record<string, unknown> {
  const submission = formatRow({
    id: row.id,
    vendor_id: row.vendor_id,
    category_id: row.category_id,
    title: row.title,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    condition: row.condition,
    location: row.location,
    estimated_value: row.estimated_value,
    image_url: row.image_url,
    status: row.status,
    admin_notes: row.admin_notes,
    rejection_reason: row.rejection_reason,
    actual_value: row.actual_value,
    submitted_at: row.submitted_at,
    processed_at: row.processed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  }) as Record<string, unknown>;

  submission.vendor_id = {
    id: row.vendor_id,
    full_name: row.vendor_full_name,
    business_name: row.vendor_business_name ?? '',
    email: row.vendor_email,
    phone: row.vendor_phone,
    address: row.vendor_address
  };

  submission.category_id = {
    id: row.category_id,
    name: row.category_name,
    description: row.category_description,
    color: row.category_color,
    icon: row.category_icon
  };

  return submission;
}

const SourceWasteSubmission = {
  find: async (conditions: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
    let query = `
      SELECT sws.*,
             u.full_name as vendor_full_name, u.business_name as vendor_business_name,
             u.email as vendor_email,
             u.phone as vendor_phone, u.address as vendor_address,
             wc.name as category_name, wc.description as category_description,
             wc.color as category_color, wc.icon as category_icon
      FROM source_waste_submissions sws
      LEFT JOIN users u ON sws.vendor_id = u.id
      LEFT JOIN waste_categories wc ON sws.category_id = wc.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (conditions.vendor_id) {
      query += ' AND sws.vendor_id = ?';
      params.push(conditions.vendor_id);
    }
    if (conditions.status) {
      query += ' AND sws.status = ?';
      params.push(conditions.status);
    }

    query += ' ORDER BY sws.created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    return rows.map((row) => buildSubmission(row));
  },

  findById: async (id: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT sws.*,
             u.full_name as vendor_full_name, u.business_name as vendor_business_name,
             u.email as vendor_email,
             u.phone as vendor_phone, u.address as vendor_address,
             wc.name as category_name, wc.description as category_description,
             wc.color as category_color, wc.icon as category_icon
      FROM source_waste_submissions sws
      LEFT JOIN users u ON sws.vendor_id = u.id
      LEFT JOIN waste_categories wc ON sws.category_id = wc.id
      WHERE sws.id = ?
    `,
      [id]
    );

    if (rows.length === 0) return null;
    return buildSubmission(rows[0]);
  },

  create: async (submissionData: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO source_waste_submissions (
        vendor_id, category_id, title, description, quantity, unit,
        \`condition\`, location, estimated_value, image_url,
        status, admin_notes, rejection_reason, actual_value,
        submitted_at, processed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        submissionData.vendor_id,
        submissionData.category_id,
        submissionData.title,
        submissionData.description,
        submissionData.quantity,
        submissionData.unit,
        submissionData.condition,
        submissionData.location,
        submissionData.estimated_value || 0,
        submissionData.image_url || '',
        submissionData.status || 'approved',
        submissionData.admin_notes || '',
        submissionData.rejection_reason || '',
        submissionData.actual_value || null,
        submissionData.submitted_at != null && submissionData.submitted_at !== ''
          ? toMysqlDateTime(submissionData.submitted_at as string | number | Date)
          : toMysqlDateTime(new Date()),
        toMysqlDateTimeOrNull(submissionData.processed_at)
      ]
    );

    return SourceWasteSubmission.findById(result.insertId);
  },

  findByIdAndUpdate: async (
    id: number | string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    const allowedFields = [
      'title',
      'description',
      'quantity',
      'unit',
      'condition',
      'location',
      'estimated_value',
      'image_url',
      'status',
      'admin_notes',
      'rejection_reason',
      'actual_value',
      'processed_at'
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
      return SourceWasteSubmission.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE source_waste_submissions SET ${setParts.join(', ')} WHERE id = ?`, values);

    return SourceWasteSubmission.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    const sid = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!Number.isInteger(sid) || sid < 1) {
      return { success: false };
    }
    await pool.execute('DELETE FROM inventory_items WHERE source_waste_submission_id = ?', [sid]);
    await pool.execute('DELETE FROM products WHERE source_waste_submission_id = ?', [sid]);
    await pool.execute('DELETE FROM source_waste_submissions WHERE id = ?', [sid]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM source_waste_submissions');
    return { changes: 0 };
  }
};

export default SourceWasteSubmission;
