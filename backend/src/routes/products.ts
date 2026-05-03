import express from 'express';
import Product from '../models/Product.js';
import upload, { getFileUrl, deleteFile } from '../utils/fileUpload.js';

const router = express.Router();

function parseIncludeRemoved(q: unknown): boolean {
  const s = String(q ?? '').toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

function parsePublicCatalog(q: unknown): boolean {
  const s = String(q ?? '').toLowerCase();
  return s === '1' || s === 'true' || s === 'yes';
}

router.get('/', async (req, res) => {
  try {
    const publicOnly = parsePublicCatalog(req.query.public);
    const includeRemoved = publicOnly ? false : parseIncludeRemoved(req.query.include_removed);
    const conditions: Record<string, unknown> = { include_removed: includeRemoved };
    if (publicOnly) {
      conditions.is_available = true;
      conditions.is_public = true;
    }
    const products = await Product.find(conditions);
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const includeRemoved = parseIncludeRemoved(req.query.include_removed);
    const product = await Product.findById(req.params.id, { includeRemoved });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

/** Clear soft-delete so the product appears in the public catalog again (admin). */
router.post('/:id/restore', async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id, { includeRemoved: true });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (!existing.deleted_at) {
      return res.status(400).json({ success: false, message: 'Product is not removed from catalog' });
    }
    const stock = Number(existing.stock_quantity) || 0;
    const product = await Product.findByIdAndUpdate(req.params.id, {
      deleted_at: null,
      is_available: stock > 0
    });
    res.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = String(req.body.image_url || '');
    if (req.file) {
      imageUrl = getFileUrl(req.file.filename, 'products');
    }

    const stockQty = parseInt(String(req.body.stock_quantity), 10) || 0;
    const pubRaw = req.body.is_public;
    const isPublic =
      pubRaw === false || pubRaw === 'false' || pubRaw === 0 || pubRaw === '0' ? false : true;
    const productData: Record<string, unknown> = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(String(req.body.price)),
      category: req.body.category,
      image_url: imageUrl,
      stock_quantity: stockQty,
      unit: req.body.unit,
      is_available: stockQty > 0 ? req.body.is_available !== false && req.body.is_available !== 'false' : false,
      is_public: isPublic
    };

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (req.file) {
      deleteFile(`products/${req.file.filename}`);
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id, { includeRemoved: true });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates: Record<string, unknown> = { ...req.body };

    if (req.file) {
      const oldUrl = existingProduct.image_url;
      if (oldUrl && typeof oldUrl === 'string') {
        deleteFile(oldUrl);
      }
      updates.image_url = getFileUrl(req.file.filename, 'products');
    }

    if (updates.stock_quantity !== undefined && Number(updates.stock_quantity) === 0) {
      updates.is_available = false;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (req.file) {
      deleteFile(`products/${req.file.filename}`);
    }
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

/** Soft-delete: product row and image file remain; hidden from public catalog. */
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id, { includeRemoved: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Product removed from catalog (record retained for orders and reporting).'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

export default router;
