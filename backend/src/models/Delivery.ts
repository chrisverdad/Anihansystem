import { pool, formatRow, formatRows } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

const Delivery = {
  find: async (conditions: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
    let query = 'SELECT * FROM deliveries WHERE 1=1';
    const params: unknown[] = [];

    if (conditions.order_id) {
      query += ' AND order_id = ?';
      params.push(conditions.order_id);
    }
    if (conditions.vendor_id != null && conditions.vendor_id !== '') {
      query += ' AND vendor_id = ?';
      params.push(conditions.vendor_id);
    }
    if (conditions.status) {
      query += ' AND status = ?';
      params.push(conditions.status);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return formatRows(rows);
  },

  findById: async (id: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM deliveries WHERE id = ?', [id]);
    return formatRow(rows[0]);
  },

  findByOrderId: async (orderId: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM deliveries WHERE order_id = ? LIMIT 1',
      [orderId]
    );
    return formatRow(rows[0]);
  },

  create: async (deliveryData: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    const vRaw = deliveryData.vendor_id;
    const vNum = vRaw != null && vRaw !== '' ? Number(vRaw) : NaN;
    const vendorId = Number.isInteger(vNum) && vNum >= 1 ? vNum : null;

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO deliveries (
        order_id, vendor_id, delivery_person, delivery_vehicle, pickup_time,
        delivery_time, status, notes, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        deliveryData.order_id,
        vendorId,
        deliveryData.delivery_person || '',
        deliveryData.delivery_vehicle || '',
        deliveryData.pickup_time || null,
        deliveryData.delivery_time || null,
        deliveryData.status || 'pending',
        deliveryData.notes || '',
        deliveryData.admin_notes || ''
      ]
    );

    return Delivery.findById(result.insertId);
  },

  findByIdAndUpdate: async (
    id: number | string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    const allowedFields = [
      'delivery_person',
      'delivery_vehicle',
      'pickup_time',
      'delivery_time',
      'status',
      'notes',
      'admin_notes',
      'vendor_id'
    ];
    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setParts.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setParts.length === 0) {
      return Delivery.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE deliveries SET ${setParts.join(', ')} WHERE id = ?`, values);

    return Delivery.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM deliveries WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM deliveries');
    return { changes: 0 };
  }
};

export default Delivery;
