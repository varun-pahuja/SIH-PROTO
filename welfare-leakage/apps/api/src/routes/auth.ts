import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { loginSchema, refreshSchema } from './validation.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import { requireAuth, revokeToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Too many auth attempts', statusCode: 429 },
});

// Demo users (in production: PostgreSQL users table)
// Passwords are pre-hashed with bcrypt cost 12
const DEMO_USERS = [
  {
    id: 'officer-1',
    email: 'officer@welfare.gov.in',
    passwordHash: bcrypt.hashSync('Officer@2026', 12),
    role: 'officer' as const,
    fullName: 'Officer Priya Sharma',
    department: 'District Welfare Bureau',
    stateCode: 'MH',
    permissions: ['beneficiary:read', 'beneficiary:search', 'flag:read', 'flag:write', 'flag:resolve', 'grievance:read', 'report:export', 'heatmap:read', 'ml:read'],
  },
  {
    id: 'admin-1',
    email: 'admin@welfare.gov.in',
    passwordHash: bcrypt.hashSync('Admin@2026', 12),
    role: 'admin' as const,
    fullName: 'Admin Rajesh Kumar',
    department: 'MeitY — NIC',
    stateCode: null,
    permissions: ['*'],
  },
];

// Refresh token storage (in production: Redis or DB)
const refreshTokens = new Map<string, { userId: string; family: string; expiresAt: number }>();

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: parsed.error.errors.map((e) => e.message).join('; '),
      statusCode: 400,
    });
    return;
  }

  const { email, password } = parsed.data;
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    logAudit(req, 'auth.login_failed', 'auth', email, { reason: 'invalid_credentials' });
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid email or password', statusCode: 401 });
    return;
  }

  const family = crypto.randomUUID();
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  });
  const refreshToken = signRefreshToken({ sub: user.id, type: 'refresh', family });

  // Store refresh token
  const refreshPayload = verifyToken(refreshToken) as { jti: string };
  refreshTokens.set(refreshPayload.jti, {
    userId: user.id,
    family,
    expiresAt: Date.now() + 7 * 24 * 3600000,
  });

  logAudit(req, 'auth.login', 'user', user.id, { role: user.role });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      department: user.department,
      stateCode: user.stateCode,
    },
  });
});

router.post('/refresh', (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Refresh token required', statusCode: 400 });
    return;
  }

  try {
    const payload = verifyToken(parsed.data.refreshToken);
    if (!('type' in payload) || payload.type !== 'refresh') {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token type', statusCode: 401 });
      return;
    }

    const stored = refreshTokens.get(payload.jti);
    if (!stored || stored.expiresAt < Date.now()) {
      refreshTokens.delete(payload.jti);
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Refresh token expired', statusCode: 401 });
      return;
    }

    const user = DEMO_USERS.find((u) => u.id === payload.sub);
    if (!user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'User not found', statusCode: 401 });
      return;
    }

    // Rotation: revoke old, issue new
    refreshTokens.delete(payload.jti);
    const newRefreshToken = signRefreshToken({ sub: user.id, type: 'refresh', family: stored.family });
    const newPayload = verifyToken(newRefreshToken) as { jti: string };
    refreshTokens.set(newPayload.jti, {
      userId: user.id,
      family: stored.family,
      expiresAt: Date.now() + 7 * 24 * 3600000,
    });

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid refresh token', statusCode: 401 });
  }
});

router.post('/logout', requireAuth, (req: Request, res: Response) => {
  if (req.user) {
    revokeToken(req.user.jti);
    logAudit(req, 'auth.logout', 'user', req.user.sub);
  }
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = DEMO_USERS.find((u) => u.id === req.user!.sub);
  if (!user) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'User not found', statusCode: 404 });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    department: user.department,
    stateCode: user.stateCode,
  });
});

export default router;
