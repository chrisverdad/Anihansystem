import express from 'express';
import WasteType from '../models/WasteType.js';
import WasteCategory from '../models/WasteCategory.js';
import WasteSubmission from '../models/WasteSubmission.js';
import SourceWasteSubmission from '../models/SourceWasteSubmission.js';
import InventoryItem from '../models/InventoryItem.js';
import Product from '../models/Product.js';
import { uploadWaste, uploadInventory, getFileUrl, deleteFile } from '../utils/fileUpload.js';

const router = express.Router();

function mapSubmissionUnitToInventoryUnit(unit: string): string {
  const u = String(unit || 'kg').toLowerCase();
  const map: Record<string, string> = {
    liters: 'bottles',
    baskets: 'pieces',
    kg: 'kg',
    pieces: 'pieces',
    bags: 'bags',
    boxes: 'boxes'
  };
  const m = map[u] || 'kg';
  const allowed = ['kg', 'bags', 'bottles', 'pieces', 'jars', 'boxes'];
  return allowed.includes(m) ? m : 'kg';
}

function wasteCategoryNameToProductCategory(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('compost')) return 'compost';
  if (n.includes('fertil')) return 'fertilizer';
  if (n.includes('preserv')) return 'preserved_food';
  if (n.includes('process') || n.includes('fruit') || n.includes('veget')) return 'processed_food';
  return 'other';
}

router.get('/types', async (_req, res) => {
  try {
    const wasteTypes = await WasteType.find({});
    res.json({ success: true, data: wasteTypes });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/types', async (req, res) => {
  try {
    const wasteType = await WasteType.create(req.body);
    res.status(201).json({ success: true, data: wasteType });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await WasteCategory.find({});
    res.json({ success: true, data: categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = await WasteCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await WasteCategory.findByIdAndUpdate(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await WasteCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/submissions', async (_req, res) => {
  try {
    const submissions = await WasteSubmission.find({});
    res.json({ success: true, data: submissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/submissions', async (req, res) => {
  try {
    const submission = await WasteSubmission.create(req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/submissions/:id', async (req, res) => {
  try {
    const submission = await WasteSubmission.findByIdAndUpdate(req.params.id, req.body);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.delete('/submissions/:id', async (req, res) => {
  try {
    await WasteSubmission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/source-submissions', async (_req, res) => {
  try {
    const submissions = await SourceWasteSubmission.find({});
    res.json({ success: true, data: submissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/source-submissions', uploadWaste.single('image'), async (req, res) => {
  try {
    const body = req.body || {};
    const vendorId =
      body.vendor_id != null && body.vendor_id !== '' ? parseInt(String(body.vendor_id), 10) : NaN;
    const categoryId =
      body.category_id != null && body.category_id !== '' ? parseInt(String(body.category_id), 10) : NaN;
    if (!Number.isInteger(vendorId) || vendorId < 1) {
      return res.status(400).json({ success: false, message: 'Valid vendor is required.' });
    }
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return res.status(400).json({ success: false, message: 'Please select a category.' });
    }
    const qty = parseFloat(String(body.quantity ?? 0));
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }
    const titleTrim = String(body.title || '').trim();
    const descTrim = String(body.description || '').trim();
    const locTrim = String(body.location || '').trim();
    if (!titleTrim) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!descTrim) {
      return res.status(400).json({ success: false, message: 'Description is required.' });
    }
    if (!locTrim) {
      return res.status(400).json({ success: false, message: 'Location is required.' });
    }
    let imageUrl = String(body.image_url || '');
    if (req.file) {
      imageUrl = getFileUrl(req.file.filename, 'waste');
    }
    const submissionData: Record<string, unknown> = {
      vendor_id: vendorId,
      category_id: categoryId,
      title: titleTrim,
      description: descTrim,
      quantity: qty,
      unit: body.unit || 'kg',
      condition: body.condition || 'other',
      location: locTrim,
      estimated_value: parseFloat(String(body.estimated_value)) || 0,
      image_url: imageUrl,
      status: 'approved'
    };
    const submission = await SourceWasteSubmission.create(submissionData);
    if (submission && submission.id != null) {
      const subId = Number(submission.id);
      if (Number.isInteger(subId) && subId >= 1) {
        try {
          const qty = Number(submission.quantity) || 0;
          const est = parseFloat(String(submission.estimated_value ?? 0)) || 0;
          const pricePer =
            qty > 0 ? Math.max(0, Math.round((est / qty) * 100) / 100) : Math.max(0, est);
          const totalVal =
            qty > 0 ? Math.max(0, Math.round(qty * pricePer * 100) / 100) : est;
          const stockQty = Math.max(0, Math.floor(qty) || (qty > 0 ? 1 : 0));
          const invUnit = mapSubmissionUnitToInventoryUnit(String(submission.unit || 'kg'));
          let prodCategory = 'other';
          const cat = await WasteCategory.findById(categoryId);
          if (cat && typeof cat.name === 'string') {
            prodCategory = wasteCategoryNameToProductCategory(cat.name);
          }
          const title = String(submission.title || 'Waste listing').trim() || 'Waste listing';
          const desc = String(submission.description || '').trim() || title;
          const img = String(submission.image_url || '');

          await InventoryItem.create({
            vendor_id: vendorId,
            product_name: title,
            description: desc,
            category: prodCategory,
            quantity: qty,
            unit: invUnit,
            price_per_unit: pricePer,
            total_value: totalVal || pricePer * qty || 0,
            source_waste_submission_id: subId,
            image_url: img,
            is_available: true
          });

          await Product.create({
            name: title,
            description: desc,
            price: pricePer,
            category: prodCategory,
            image_url: img,
            stock_quantity: stockQty,
            unit: invUnit,
            is_available: stockQty > 0,
            source_waste_submission_id: subId,
            vendor_id: vendorId
          });
        } catch (syncErr) {
          console.error('Auto-create inventory/product from source submission:', syncErr);
        }
      }
    }
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    if (req.file) {
      deleteFile(`waste/${req.file.filename}`);
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/source-submissions/:id', uploadWaste.single('image'), async (req, res) => {
  try {
    const existing = await SourceWasteSubmission.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const body = req.body || {};
    const allowedStatuses = new Set(['approved', 'collected', 'processed'])
    let nextStatus: string | undefined =
      body.status != null ? String(body.status) : undefined
    if (nextStatus !== undefined && !allowedStatuses.has(nextStatus)) {
      nextStatus = undefined
    }

    const updates: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      quantity: body.quantity != null ? parseFloat(String(body.quantity)) : undefined,
      unit: body.unit,
      condition: body.condition,
      location: body.location,
      estimated_value:
        body.estimated_value != null ? parseFloat(String(body.estimated_value)) : undefined,
      status: nextStatus,
      admin_notes: body.admin_notes,
      rejection_reason: body.rejection_reason,
      actual_value: body.actual_value != null ? parseFloat(String(body.actual_value)) : undefined,
      processed_at: body.processed_at
    };
    if (req.file) {
      const existingUrl = existing.image_url;
      if (existingUrl && typeof existingUrl === 'string') deleteFile(existingUrl);
      updates.image_url = getFileUrl(req.file.filename, 'waste');
    } else if (body.image_url !== undefined) {
      updates.image_url = body.image_url;
    }
    for (const k of Object.keys(updates)) {
      const key = k as keyof typeof updates;
      if (updates[key] === undefined) delete updates[key];
    }
    const submission = await SourceWasteSubmission.findByIdAndUpdate(req.params.id, updates);
    res.json({ success: true, data: submission });
  } catch (error) {
    if (req.file) {
      deleteFile(`waste/${req.file.filename}`);
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.delete('/source-submissions/:id', async (req, res) => {
  try {
    const existing = await SourceWasteSubmission.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    await SourceWasteSubmission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/inventory', async (_req, res) => {
  try {
    const items = await InventoryItem.find({});
    res.json({ success: true, data: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/inventory', uploadInventory.single('image'), async (req, res) => {
  try {
    const body = req.body || {};
    let imageUrl = body.image_url != null ? String(body.image_url) : '';
    if (req.file) {
      imageUrl = getFileUrl(req.file.filename, 'inventory');
    }
    const quantity = parseFloat(String(body.quantity)) || 0;
    const pricePerUnit = parseFloat(String(body.price_per_unit)) || 0;
    const vendorId =
      body.vendor_id != null && body.vendor_id !== '' ? parseInt(String(body.vendor_id), 10) : NaN;
    if (vendorId == null || !Number.isInteger(vendorId) || vendorId < 1) {
      return res.status(400).json({ success: false, message: 'Valid vendor is required.' });
    }
    const sourceId =
      body.source_waste_submission_id != null && body.source_waste_submission_id !== ''
        ? body.source_waste_submission_id
        : null;
    const itemData: Record<string, unknown> = {
      vendor_id: vendorId,
      product_name: body.product_name != null ? String(body.product_name) : '',
      description: body.description != null ? String(body.description) : '',
      category: body.category != null ? String(body.category) : 'other',
      quantity,
      unit: body.unit != null ? String(body.unit) : 'kg',
      price_per_unit: pricePerUnit,
      total_value: quantity * pricePerUnit,
      source_waste_submission_id: sourceId,
      image_url: imageUrl,
      is_available: body.is_available !== 'false' && body.is_available !== false
    };
    const item = await InventoryItem.create(itemData);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (req.file) deleteFile(`inventory/${req.file.filename}`);
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/inventory/:id', uploadInventory.single('image'), async (req, res) => {
  try {
    const existing = await InventoryItem.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    const body = req.body || {};
    let imageUrl: unknown = body.image_url;
    if (req.file) {
      const existingUrl = existing.image_url;
      if (existingUrl && typeof existingUrl === 'string') deleteFile(existingUrl);
      imageUrl = getFileUrl(req.file.filename, 'inventory');
    }
    const quantity = body.quantity != null ? parseFloat(String(body.quantity)) : undefined;
    const pricePerUnit = body.price_per_unit != null ? parseFloat(String(body.price_per_unit)) : undefined;
    let totalValue = body.total_value != null ? parseFloat(String(body.total_value)) : undefined;
    if (quantity != null && pricePerUnit != null) totalValue = quantity * pricePerUnit;
    const updates: Record<string, unknown> = {
      product_name: body.product_name,
      description: body.description,
      category: body.category,
      quantity,
      unit: body.unit,
      price_per_unit: pricePerUnit,
      total_value: totalValue,
      source_waste_submission_id:
        body.source_waste_submission_id !== undefined && body.source_waste_submission_id !== ''
          ? body.source_waste_submission_id
          : null,
      is_available:
        body.is_available !== undefined
          ? body.is_available !== 'false' && body.is_available !== false
          : undefined
    };
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    for (const k of Object.keys(updates)) {
      const key = k as keyof typeof updates;
      if (updates[key] === undefined) delete updates[key];
    }
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, updates);
    res.json({ success: true, data: item });
  } catch (error) {
    if (req.file) deleteFile(`inventory/${req.file.filename}`);
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

export default router;
