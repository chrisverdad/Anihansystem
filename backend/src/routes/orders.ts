import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Delivery from '../models/Delivery.js';
import { authenticate, type JwtAuthPayload } from '../middleware/authJwt.js';
import { enrichOrderWithDelivery } from '../utils/orderDeliveryInfo.js';

const router = express.Router();

function vendorIdFromOrder(order: Record<string, unknown>): number | null {
  const p = order.product_id;
  if (p && typeof p === 'object' && p !== null && 'vendor_id' in p) {
    const v = Number((p as { vendor_id?: unknown }).vendor_id);
    return Number.isInteger(v) && v >= 1 ? v : null;
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const q = req.query.vendor_id;
    const conditions: Record<string, unknown> = {};
    if (q != null && String(q).trim() !== '') {
      conditions.vendor_id = String(q).trim();
    }
    const orders = await Order.find(conditions);
    for (const o of orders) {
      await enrichOrderWithDelivery(o);
    }

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order = await enrichOrderWithDelivery(order);
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      quantity,
      total_price,
      payment_method,
      payment_reference,
      delivery_address,
      delivery_notes
    } = req.body;

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const stock = Number(product.stock_quantity);
    const qty = Number(quantity);
    if (stock < qty) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    const order = await Order.create({
      user_id,
      product_id,
      quantity,
      total_price,
      payment_method,
      payment_reference: payment_reference || '',
      delivery_address,
      delivery_notes: delivery_notes || '',
      order_date: new Date()
    });

    const newStock = stock - qty;
    await Product.findByIdAndUpdate(product_id, {
      stock_quantity: newStock,
      is_available: newStock > 0
    });

    if (order?.id != null) {
      const existingDel = await Delivery.findByOrderId(order.id as number);
      if (!existingDel) {
        const vidRaw = product.vendor_id != null ? Number(product.vendor_id) : NaN;
        const vendorId = Number.isInteger(vidRaw) && vidRaw >= 1 ? vidRaw : null;
        await Delivery.create({
          order_id: order.id,
          vendor_id: vendorId,
          status: 'pending',
          notes: ''
        });
      }
    }

    const enriched = await enrichOrderWithDelivery(order);
    res.status(201).json({
      success: true,
      data: enriched
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const auth = (req as express.Request & { auth: JwtAuthPayload }).auth;
    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const productVendorId = vendorIdFromOrder(existing);
    if (auth.role === 'vendor') {
      if (productVendorId == null || Number(auth.userId) !== productVendorId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update orders for your own products'
        });
      }
    } else if (auth.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const body = req.body || {};
    const vendorAllowed = new Set([
      'status',
      'payment_status',
      'delivery_status',
      'payment_reference',
      'delivery_notes',
      'notes'
    ]);
    const adminAllowed = new Set([
      'status',
      'payment_status',
      'payment_method',
      'payment_reference',
      'delivery_status',
      'delivery_address',
      'delivery_notes',
      'delivery_date',
      'notes'
    ]);
    const allow = auth.role === 'admin' ? adminAllowed : vendorAllowed;

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allow.has(key) && value !== undefined) updates[key] = value;
    }

    if (updates.status === 'delivered' && updates.delivery_status === undefined) {
      updates.delivery_status = 'delivered';
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No allowed fields to update' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (updates.delivery_status != null && order.id != null) {
      const del = await Delivery.findByOrderId(order.id as number);
      if (del?.id != null) {
        await Delivery.findByIdAndUpdate(del.id as number | string, {
          status: updates.delivery_status
        });
      }
    }

    const out = await enrichOrderWithDelivery(order);
    res.json({
      success: true,
      data: out
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

export default router;
