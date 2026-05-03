import { pool, formatRow } from '../config/database.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export type ProductRecord = Record<string, unknown>;

export type ProductFindOptions = {
  includeRemoved?: boolean;
};

const productSelectSql = `
  SELECT p.*,
    v.full_name AS vendor_user_full_name,
    v.business_name AS vendor_business_name,
    v.email AS vendor_user_email
  FROM products p
  LEFT JOIN users v ON p.vendor_id = v.id
`;

function shapeProduct(row: RowDataPacket | undefined | null): ProductRecord | null {
  if (!row) return null;
  const r = row as Record<string, unknown>;
  const vendorFull = r.vendor_user_full_name;
  const vendorBiz = r.vendor_business_name;
  const vendorEmail = r.vendor_user_email;
  const { vendor_user_full_name, vendor_business_name, vendor_user_email, ...rest } = r;
  const base = formatRow(rest as RowDataPacket);
  if (!base) return null;
  if (base.vendor_id != null && String(base.vendor_id) !== '') {
    base.vendor = {
      id: String(base.vendor_id),
      full_name: vendorFull ?? '',
      business_name: vendorBiz ?? '',
      email: vendorEmail ?? ''
    };
  }
  return base;
}

function appendNotRemovedClause(query: string, includeRemoved: boolean | undefined): string {
  if (includeRemoved) return query;
  return `${query} AND p.deleted_at IS NULL`;
}

const Product = {
  find: async (conditions: Record<string, unknown> = {}): Promise<ProductRecord[]> => {
    const includeRemoved = conditions.include_removed === true;
    let query = appendNotRemovedClause(`${productSelectSql} WHERE 1=1`, includeRemoved);
    const params: unknown[] = [];

    if (conditions.is_available !== undefined) {
      query += ' AND p.is_available = ?';
      params.push(conditions.is_available ? 1 : 0);
    }
    if (conditions.is_public !== undefined) {
      query += ' AND p.is_public = ?';
      params.push(conditions.is_public ? 1 : 0);
    }
    if (conditions.category) {
      query += ' AND p.category = ?';
      params.push(conditions.category);
    }

    query += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows.map((row) => shapeProduct(row)!).filter(Boolean);
  },

  findById: async (
    id: number | string,
    options?: ProductFindOptions
  ): Promise<ProductRecord | null> => {
    let query = appendNotRemovedClause(`${productSelectSql} WHERE p.id = ?`, options?.includeRemoved);
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    return shapeProduct(rows[0]);
  },

  create: async (productData: Record<string, unknown>): Promise<ProductRecord | null> => {
    const stockQty = Number(productData.stock_quantity) || 0;
    const isAvailable =
      stockQty > 0 ? productData.is_available !== false : false;

    const swSid = productData.source_waste_submission_id;
    const subId =
      swSid != null && swSid !== ''
        ? Number(swSid)
        : NaN;
    const sourceSub =
      Number.isInteger(subId) && subId >= 1 ? subId : null;

    const vRaw = productData.vendor_id;
    const vNum = vRaw != null && vRaw !== '' ? Number(vRaw) : NaN;
    const vendorId = Number.isInteger(vNum) && vNum >= 1 ? vNum : null;

    const pubRaw = productData.is_public;
    const isPublic =
      pubRaw === false ||
      pubRaw === 'false' ||
      pubRaw === 0 ||
      pubRaw === '0'
        ? false
        : true;

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO products (
        name, description, price, category, image_url,
        stock_quantity, unit, is_available, is_public, source_waste_submission_id, vendor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        productData.name,
        productData.description,
        productData.price,
        productData.category,
        productData.image_url || '',
        stockQty,
        productData.unit,
        isAvailable ? 1 : 0,
        isPublic ? 1 : 0,
        sourceSub,
        vendorId
      ]
    );

    return Product.findById(result.insertId);
  },

  findByIdAndUpdate: async (id: number | string, updates: Record<string, unknown>): Promise<ProductRecord | null> => {
    const allowedFields = [
      'name',
      'description',
      'price',
      'category',
      'image_url',
      'stock_quantity',
      'unit',
      'is_available',
      'is_public',
      'vendor_id',
      'deleted_at'
    ];

    const patch = { ...updates };
    if (patch.stock_quantity !== undefined && patch.stock_quantity === 0) {
      patch.is_available = false;
    }

    const setParts: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(patch)) {
      if (allowedFields.includes(key)) {
        if (key === 'is_available' || key === 'is_public') {
          const off =
            value === false ||
            value === 0 ||
            value === '0' ||
            value === 'false';
          setParts.push(`${key} = ?`);
          values.push(off ? 0 : 1);
        } else if (key === 'vendor_id') {
          const n = value != null && value !== '' ? Number(value) : NaN;
          setParts.push(`${key} = ?`);
          values.push(Number.isInteger(n) && n >= 1 ? n : null);
        } else if (key === 'deleted_at') {
          setParts.push(`${key} = ?`);
          values.push(value === null || value === '' ? null : value);
        } else {
          setParts.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (setParts.length === 0) {
      return Product.findById(id, { includeRemoved: true });
    }

    values.push(id);
    await pool.execute(`UPDATE products SET ${setParts.join(', ')} WHERE id = ?`, values);

    return Product.findById(id, { includeRemoved: true });
  },

  /** Soft-delete: row stays in DB; hidden from public catalog (deleted_at set). */
  findByIdAndDelete: async (id: number | string): Promise<{ success: boolean }> => {
    await pool.execute(
      `UPDATE products SET deleted_at = CURRENT_TIMESTAMP, is_available = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return { success: true };
  },

  /** Hard delete all rows (seed / dev reset only). */
  deleteMany: async (_conditions: Record<string, unknown> = {}): Promise<{ changes: number }> => {
    await pool.execute('DELETE FROM products');
    return { changes: 0 };
  }
};

export default Product;
