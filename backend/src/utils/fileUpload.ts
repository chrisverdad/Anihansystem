import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import type { Request } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..', '..');

const uploadDirs = {
  products: path.join(backendRoot, 'uploads', 'products'),
  waste: path.join(backendRoot, 'uploads', 'waste'),
  users: path.join(backendRoot, 'uploads', 'users'),
  inventory: path.join(backendRoot, 'uploads', 'inventory')
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const uploadType = (req.body?.uploadType as string) || 'products';
    const uploadDir = uploadDirs[uploadType as keyof typeof uploadDirs] || uploadDirs.products;
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const err = new Error('Only image files are allowed!');
    (cb as (e: Error | null, accept?: boolean) => void)(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter
});

const storageWaste = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirs.waste),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});
const uploadWaste = multer({
  storage: storageWaste,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

const storageInventory = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirs.inventory),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});
const uploadInventory = multer({
  storage: storageInventory,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

const storageUsers = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirs.users),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});
const fileFilterVendorDoc: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else (cb as (e: Error | null, accept?: boolean) => void)(new Error('Only PDF and image files are allowed'), false);
};
const uploadVendorDoc = multer({
  storage: storageUsers,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilterVendorDoc
});

export { uploadWaste, uploadInventory, uploadVendorDoc };

export const getFileUrl = (filename: string, uploadType = 'products'): string => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  if (filename.startsWith('/')) {
    return filename;
  }
  return `/uploads/${uploadType}/${filename}`;
};

export const deleteFile = (filePath: string): boolean => {
  try {
    if (!filePath) return false;

    if (
      filePath.startsWith('http://') ||
      filePath.startsWith('https://') ||
      filePath.startsWith('/photos/')
    ) {
      return false;
    }

    let fullPath: string;
    if (filePath.startsWith('/uploads/')) {
      const relativePath = filePath.replace('/uploads/', '');
      fullPath = path.join(backendRoot, 'uploads', relativePath);
    } else {
      fullPath = path.join(backendRoot, 'uploads', filePath);
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export default upload;
