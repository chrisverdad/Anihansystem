import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { uploadVendorDoc } from '../utils/fileUpload.js';
import type { UserRecord } from '../models/User.js';
import { authenticate, type JwtAuthPayload } from '../middleware/authJwt.js';

const router = express.Router();

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    console.warn('JWT_SECRET is not set; using insecure default for development only');
    return 'anihan-dev-jwt-secret-change-me';
  }
  return s;
}

function stripPassword(user: UserRecord | null): UserRecord | null {
  if (!user) return null;
  const copy: UserRecord = { ...user };
  delete copy.password;
  return copy;
}

router.post('/login', async (req, res) => {
  try {
    const body = req.body || {};
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user || typeof user.password !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    const userObj = stripPassword(user);

    res.json({
      success: true,
      data: {
        user: userObj,
        token
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.post('/register', uploadVendorDoc.single('business_license'), async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim();
    const password = body.password;
    const full_name = String(body.full_name || '').trim();
    const role = String(body.role || 'user').toLowerCase();
    const phone = String(body.phone || '').trim();
    const address = String(body.address || '').trim();
    const business_name = String(body.business_name || '').trim();
    const business_type = String(body.business_type || '').trim();
    const years_in_business = String(body.years_in_business || '').trim();

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required' });
    }
    if (!['user', 'vendor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be user or vendor' });
    }
    if (role === 'vendor' && !business_name) {
      return res.status(400).json({ success: false, message: 'Business name is required for vendors' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const business_license_path = req.file ? `/uploads/users/${req.file.filename}` : '';

    const userData: Record<string, unknown> = {
      email,
      password: hashedPassword,
      full_name,
      role,
      phone: phone || '',
      address: address || '',
      is_active: role === 'user',
      vendor_status: role === 'vendor' ? 'pending' : undefined,
      business_name: role === 'vendor' ? business_name : '',
      business_type: role === 'vendor' ? business_type : '',
      years_in_business: role === 'vendor' ? years_in_business : '',
      business_license: business_license_path || ''
    };

    const user = await User.create(userData);
    const userObj = stripPassword(user);

    let token: string | null = null;
    if (role === 'user' && user) {
      token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), { expiresIn: '7d' });
    }

    res.status(201).json({
      success: true,
      data: {
        user: userObj,
        token
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: number };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: { user: stripPassword(user) }
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || '').trim();
    const password = body.password;
    const full_name = String(body.full_name || '').trim();
    const role = String(body.role || 'user').toLowerCase();
    const phone = String(body.phone || '').trim();
    const address = String(body.address || '').trim();

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required' });
    }
    if (!['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be user, vendor, or admin' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const userData: Record<string, unknown> = {
      email,
      password: hashedPassword,
      full_name,
      role,
      phone: phone || '',
      address: address || '',
      is_active: true,
      vendor_status: role === 'vendor' ? 'pending' : undefined
    };

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      data: stripPassword(user)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await User.find({});
    const usersWithoutPassword = users.map((u) => stripPassword(u));

    res.json({
      success: true,
      data: usersWithoutPassword
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: stripPassword(user)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Record<string, unknown> = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(String(updates.password), 10);
    }

    const user = await User.findByIdAndUpdate(id, updates);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: stripPassword(user)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const auth = (req as express.Request & { auth: JwtAuthPayload }).auth;
    const body = req.body || {};
    const currentPassword = String(body.current_password ?? '');
    const newPassword = String(body.new_password ?? '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const row = await User.findById(auth.userId);
    if (!row || typeof row.password !== 'string') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, row.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(auth.userId, { password: hashed });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId?: unknown };
    const userId = Number(decoded.userId);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const updates: Record<string, unknown> = { ...req.body };
    delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates);

    res.json({
      success: true,
      data: { user: stripPassword(user) }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message });
  }
});

export default router;
