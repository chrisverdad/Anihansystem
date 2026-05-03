import express from 'express';
import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import { enrichOrderWithDelivery } from '../utils/orderDeliveryInfo.js';

const router = express.Router();

async function shapeDeliveryRow(
  row: Record<string, unknown>,
  options: { stripAdminNotes?: boolean }
): Promise<Record<string, unknown>> {
  let order = await Order.findById(row.order_id as number);
  order = (await enrichOrderWithDelivery(order)) as typeof order;
  const item: Record<string, unknown> = { ...row, order };
  if (options.stripAdminNotes) {
    delete item.admin_notes;
  }
  return item;
}

/** List deliveries. Admin: omit vendor_id query for all. Vendor: ?vendor_id=<id> for own rows only; admin_notes stripped. */
router.get('/', async (req, res) => {
  try {
    const q = req.query.vendor_id;
    const vendorScoped = q != null && String(q).trim() !== '';
    const conditions: Record<string, unknown> = {};
    if (vendorScoped) {
      conditions.vendor_id = String(q).trim();
    }

    const rows = await Delivery.find(conditions);
    const data: Record<string, unknown>[] = [];
    for (const row of rows) {
      data.push(
        await shapeDeliveryRow(row, { stripAdminNotes: vendorScoped })
      );
    }

    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vendorScoped =
      req.query.vendor_id != null && String(req.query.vendor_id).trim() !== '';
    const row = await Delivery.findById(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    if (vendorScoped && String(row.vendor_id ?? '') !== String(req.query.vendor_id).trim()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const data = await shapeDeliveryRow(row, { stripAdminNotes: vendorScoped });
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await Delivery.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    const vendorScoped =
      req.query.vendor_id != null && String(req.query.vendor_id).trim() !== '';
    if (vendorScoped) {
      if (String(existing.vendor_id ?? '') !== String(req.query.vendor_id).trim()) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    const body = req.body || {};
    const updates: Record<string, unknown> = {};
    const fields = [
      'status',
      'delivery_person',
      'delivery_vehicle',
      'pickup_time',
      'delivery_time',
      'notes'
    ] as const;
    for (const k of fields) {
      if (body[k] !== undefined) updates[k] = body[k];
    }
    if (!vendorScoped && body.admin_notes !== undefined) {
      updates.admin_notes = body.admin_notes;
    }

    const updated = await Delivery.findByIdAndUpdate(req.params.id, updates);
    if (updates.status != null && updated?.order_id != null) {
      await Order.findByIdAndUpdate(updated.order_id as number | string, {
        delivery_status: updates.status
      });
    }

    const data = await shapeDeliveryRow(updated!, { stripAdminNotes: vendorScoped });
    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

export default router;
