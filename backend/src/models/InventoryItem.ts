import { pool, formatRow } from '../config/database.js';
import SourceWasteSubmission from './SourceWasteSubmission.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

function mapItemRow(row: RowDataPacket): Record<string, unknown> {
  return formatRow({
    id: row.id,
    vendor_id: row.vendor_id,
    product_name: row.product_name,
    description: row.description,
    category: row.category,
    quantity: row.quantity,
    unit: row.unit,
    price_per_unit: row.price_per_unit,
    total_value: row.total_value,
    source_waste_submission_id: row.source_waste_submission_id,
    image_url: row.image_url,
    is_available: row.is_available,
    quantity_history: row.quantity_history,
    created_at: row.created_at,
    updated_at: row.updated_at
  }) as Record<string, unknown>;
}

const InventoryItem = {
  find: async (conditions: Record<string, unknown> = {}): Promise<Record<string, unknown>[]> => {
    let query = `
      SELECT ii.*,
             u.full_name as vendor_full_name, u.email as vendor_email,
             u.phone as vendor_phone, u.address as vendor_address
      FROM inventory_items ii
      LEFT JOIN users u ON ii.vendor_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (conditions.vendor_id) {
      query += ' AND ii.vendor_id = ?';
      params.push(conditions.vendor_id);
    }
    if (conditions.is_available !== undefined) {
      query += ' AND ii.is_available = ?';
      params.push(conditions.is_available ? 1 : 0);
    }

    query += ' ORDER BY ii.created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const items: Record<string, unknown>[] = [];
    for (const row of rows) {
      const item = mapItemRow(row);

      item.vendor_id = {
        id: row.vendor_id,
        full_name: row.vendor_full_name,
        email: row.vendor_email,
        phone: row.vendor_phone,
        address: row.vendor_address
      };

      if (row.source_waste_submission_id) {
        item.source_waste_submission_id = (await SourceWasteSubmission.findById(
          row.source_waste_submission_id as number
        )) as unknown;
      }

      items.push(item);
    }

    return items;
  },

  findById: async (id: number | string): Promise<Record<string, unknown> | null> => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT ii.*,
             u.full_name as vendor_full_name, u.email as vendor_email,
             u.phone as vendor_phone, u.address as vendor_address
      FROM inventory_items ii
      LEFT JOIN users u ON ii.vendor_id = u.id
      WHERE ii.id = ?
    `,
      [id]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const item = mapItemRow(row);

    item.vendor_id = {
      id: row.vendor_id,
      full_name: row.vendor_full_name,
      email: row.vendor_email,
      phone: row.vendor_phone,
      address: row.vendor_address
    };

    if (row.source_waste_submission_id) {
      item.source_waste_submission_id = (await SourceWasteSubmission.findById(
        row.source_waste_submission_id as number
      )) as unknown;
    }

    return item;
  },

  create: async (itemData: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
    const quantityHistory = itemData.quantity_history
      ? JSON.stringify(itemData.quantity_history)
      : null;

    const bind = (v: unknown, def: unknown) => (v === undefined ? def : v);
    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO inventory_items (
        vendor_id, product_name, description, category, quantity, unit,
        price_per_unit, total_value, source_waste_submission_id,
        image_url, is_available, quantity_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        bind(itemData.vendor_id, null),
        bind(itemData.product_name, ''),
        bind(itemData.description, ''),
        bind(itemData.category, 'other'),
        Number(itemData.quantity) || 0,
        bind(itemData.unit, 'kg'),
        Number(itemData.price_per_unit) || 0,
        Number(itemData.total_value) || 0,
        itemData.source_waste_submission_id ?? null,
        itemData.image_url ?? '',
        itemData.is_available !== undefined && itemData.is_available !== false ? 1 : 0,
        quantityHistory
      ]
    );

    return InventoryItem.findById(result.insertId);
  },

  findByIdAndUpdate: async (
    id: number | string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> => {
    const allowedFields = [
      'product_name',
      'description',
      'category',
      'quantity',
      'unit',
      'price_per_unit',
      'total_value',
      'source_waste_submission_id',
      'image_url',
      'is_available',
      'quantity_history'
    ];
    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'is_available') {
          setParts.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else if (key === 'quantity_history') {
          setParts.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          setParts.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (setParts.length === 0) {
      return InventoryItem.findById(id);
    }

    values.push(id);
    await pool.execute(`UPDATE inventory_items SET ${setParts.join(', ')} WHERE id = ?`, values);

    return InventoryItem.findById(id);
  },

  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute('DELETE FROM inventory_items WHERE id = ?', [id]);
    return { success: true };
  },

  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM inventory_items');
    return { changes: 0 };
  }
};

export default InventoryItem;
