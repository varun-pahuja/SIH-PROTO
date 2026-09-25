import { Request, Response, NextFunction } from 'express';
import { verifyToken, AccessTokenPayload } from '../utils/jwt.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

// In-memory blocklist for revoked tokens (production: Redis)
const revokedJtis = new Set<string>();

export function revokeToken(jti: string) {
  revokedJtis.add(jti);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required', statusCode: 401 });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);

    if ('type' in payload && payload.type === 'refresh') {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Refresh token not valid for API access', statusCode: 401 });
      return;
    }

    if (revokedJtis.has(payload.jti)) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token has been revoked', statusCode: 401 });
      return;
    }

    req.user = payload as AccessTokenPayload;
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token', statusCode: 401 });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required', statusCode: 401 });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions', statusCode: 403 });
      return;
    }
    next();
  };
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required', statusCode: 401 });
      return;
    }
    const hasAll = permissions.every((p) => req.user!.permissions.includes(p) || req.user!.permissions.includes('*'));
    if (!hasAll) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions', statusCode: 403 });
      return;
    }
    next();
  };
}
