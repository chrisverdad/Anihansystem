import { pool, formatRow } from '../config/database.js';
import { toMysqlDateTime, valueForMysqlDateTimeColumn } from '../utils/mysqlDateTime.js';
import Product from './Product.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export type OrderRecord = Record<string, unknown>;

function mapOrderRow(row: RowDataPacket): OrderRecord {
  return formatRow({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: row.quantity,
    total_price: row.total_price,
    status: row.status,
    payment_status: row.payment_status,
    payment_method: row.payment_method,
    payment_reference: row.payment_reference,
    receipt_image: row.receipt_image,
    delivery_status: row.delivery_status,
    delivery_address: row.delivery_address,
    delivery_notes: row.delivery_notes,
    purpose: row.purpose,
    order_date: row.order_date,
    delivery_date: row.delivery_date,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at
  }) as OrderRecord;
}

const Order = {
  find: async (conditions: Record<string, unknown> = {}): Promise<OrderRecord[]> => {
    let query = `
      SELECT o.*,
             u.full_name as user_full_name, u.email as user_email,
             u.phone as user_phone, u.address as user_address
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (conditions.user_id) {
      query += ' AND o.user_id = ?';
      params.push(conditions.user_id);
    }
    if (conditions.status) {
      query += ' AND o.status = ?';
      params.push(conditions.status);
    }
    if (conditions.vendor_id != null && conditions.vendor_id !== '') {
      const vid = Number(conditions.vendor_id);
      if (Number.isInteger(vid) && vid >= 1) {
        query +=
          ' AND EXISTS (SELECT 1 FROM products pr WHERE pr.id = o.product_id AND pr.vendor_id = ?)';
        params.push(vid);
      }
    }

    query += ' ORDER BY o.created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const orders: OrderRecord[] = [];
    for (const row of rows) {
      const order = mapOrderRow(row);

      order.user_id = {
        id: row.user_id,
        full_name: row.user_full_name,
        email: row.user_email,
        phone: row.user_phone,
        address: row.user_address
      };

      order.product_id = (await Product.findById(row.product_id as number, {
        includeRemoved: true
      })) as unknown;
      orders.push(order);
    }

    return orders;
  },

  findById: async (id: number | string): Promise<OrderRecord | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT o.*,  
             u.full_name as user_full_name, u.email as user_email,
             u.phone as user_phone, u.address as user_address
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `,
      [id]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const order = mapOrderRow(row);

    order.user_id = {
      id: row.user_id,
      full_name: row.user_full_name,
      email: row.user_email,
      phone: row.user_phone,
      address: row.user_address
    };

    order.product_id = (await Product.findById(row.product_id as number, {
      includeRemoved: true
    })) as unknown;

    return order;
  },

  create: async (orderData: Record<string, unknown>): Promise<OrderRecord | null> => {
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO orders (
        user_id, product_id, quantity, total_price, payment_method,
        payment_reference, receipt_image, delivery_address, delivery_notes, purpose, order_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        orderData.user_id,
        orderData.product_id,
        orderData.quantity,
        orderData.total_price,
        orderData.payment_method,
        orderData.payment_reference || '',
        orderData.receipt_image || '',
        orderData.delivery_address,
        orderData.delivery_notes || '',
        orderData.purpose || '',
        orderData.order_date != null && orderData.order_date !== ''
          ? toMysqlDateTime(orderData.order_date as string | number | Date)
          : toMysqlDateTime(new Date())
      ]
    );

    return Order.findById(result.insertId);
  },

  findByIdAndUpdate: async (id: number | string, updates: Record<string, unknown>): Promise<OrderRecord | null> => {
    const allowedFields = [
      'status',
      'payment_status',
      'payment_method',
      'payment_reference',
      'receipt_image',
      'delivery_status',
      'delivery_address',
      'delivery_notes',
      'purpose',
      'delivery_date',
      'notes'
    ];

    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setParts.push(`${key} = ?`);
        values.push(valueForMysqlDateTimeColumn(key, value));
      }
    }

    if (setParts.length === 0) {
      return Order.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE orders SET ${setParts.join(', ')} WHERE id = ?`, values);

    return Order.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM orders WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM orders');
    return { changes: 0 };
  }
};

export default Order;
