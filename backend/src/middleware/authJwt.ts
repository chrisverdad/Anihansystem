import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export type JwtAuthPayload = { userId: number; role: string };

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    console.warn('JWT_SECRET is not set; using insecure default for development only');
    return 'anihan-dev-jwt-secret-change-me';
  }
  return s;
}

/** Requires `Authorization: Bearer <token>` from login. Attaches `req.auth`. */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const raw = req.headers.authorization;
  const token = typeof raw === 'string' && raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as Record<string, unknown>;
    const userId = Number(decoded.userId);
    const role = typeof decoded.role === 'string' ? decoded.role : '';
    if (!Number.isInteger(userId) || userId < 1 || !role) {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }
    (req as Request & { auth: JwtAuthPayload }).auth = { userId, role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
