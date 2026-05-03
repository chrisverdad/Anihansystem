import { pool, formatRow, formatRows } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export type UserRecord = Record<string, unknown> & { id?: number; password?: string };

const User = {
  findByEmail: async (email: string): Promise<UserRecord | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    return formatRow(rows[0]) as UserRecord | null;
  },

  findById: async (id: number | string): Promise<UserRecord | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    return formatRow(rows[0]) as UserRecord | null;
  },

  find: async (conditions: Record<string, unknown> = {}): Promise<UserRecord[]> => {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: unknown[] = [];

    if (conditions.role) {
      query += ' AND role = ?';
      params.push(conditions.role);
    }
    if (conditions.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(conditions.is_active ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return formatRows(rows) as UserRecord[];
  },

  create: async (userData: Record<string, unknown>): Promise<UserRecord | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO users (
        email, password, full_name, role, phone, address, profile_photo,
        is_active, vendor_status, business_name, business_type,
        business_license, years_in_business, approval_notes, approved_by, approved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userData.email,
        userData.password,
        userData.full_name,
        userData.role,
        userData.phone || '',
        userData.address || '',
        userData.profile_photo || '',
        userData.is_active !== undefined ? (userData.is_active ? 1 : 0) : 1,
        userData.vendor_status || null,
        userData.business_name || '',
        userData.business_type || '',
        userData.business_license || '',
        userData.years_in_business || '',
        userData.approval_notes || '',
        userData.approved_by || '',
        userData.approved_at || null
      ]
    );

    return User.findById(result.insertId);
  },

  findByIdAndUpdate: async (id: number | string, updates: Record<string, unknown>): Promise<UserRecord | null> => {
    const allowedFields = [
      'email',
      'password',
      'full_name',
      'role',
      'phone',
      'address',
      'profile_photo',
      'is_active',
      'vendor_status',
      'business_name',
      'business_type',
      'business_license',
      'years_in_business',
      'approval_notes',
      'approved_by',
      'approved_at'
    ];

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
      return User.findById(id);
    }

    values.push(id);
    const q = `UPDATE users SET ${setParts.join(', ')} WHERE id = ?`;
    await pool.execute(q, values);

    return User.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM users');
    return { changes: 0 };
  }
};

export default User;
