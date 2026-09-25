import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';
import { grievanceSubmitSchema } from './validation.js';
import { grievanceLimiter } from '../middleware/rateLimit.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// In-memory grievance store (production: MongoDB)
const grievances = new Map<string, any>();

function generateTrackingId(): string {
  return `GRV-2026-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

// POST /citizen/grievance — submit grievance (rate-limited)
router.post('/grievance', grievanceLimiter, (req: Request, res: Response) => {
  const parsed = grievanceSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      statusCode: 400,
    });
    return;
  }

  const { aadhaarLast4, schemeId, issueType, description, otp } = parsed.data;

  if (otp !== config.mockOtp) {
    res.status(400).json({ error: 'INVALID_OTP', message: 'Invalid OTP', statusCode: 400 });
    return;
  }

  const trackingId = generateTrackingId();
  const now = new Date().toISOString();

  const grievance = {
    trackingId,
    aadhaarLast4, // Only last 4 stored
    schemeId,
    issueType,
    description,
    status: 'submitted',
    otpVerified: true,
    documents: [], // File upload handled separately in production
    timeline: [
      { status: 'submitted', timestamp: now, note: 'Grievance received and assigned tracking ID', updatedBy: 'system' },
    ],
    createdAt: now,
  };

  grievances.set(trackingId, grievance);
  logAudit(req, 'grievance.submitted', 'grievance', trackingId, { schemeId, issueType });

  res.status(201).json({ trackingId, message: 'Grievance submitted successfully' });
});

// GET /citizen/grievance/:trackingId — track grievance (with aadhaar last-4 verification)
router.get('/grievance', (req: Request, res: Response) => {
  const { trackingId, aadhaarLast4 } = req.query as { trackingId?: string; aadhaarLast4?: string };

  if (!trackingId || !aadhaarLast4 || !/^\d{4}$/.test(aadhaarLast4)) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'trackingId and valid aadhaarLast4 required', statusCode: 400 });
    return;
  }

  const grievance = grievances.get(trackingId);
  if (!grievance || grievance.aadhaarLast4 !== aadhaarLast4) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Grievance not found or verification failed', statusCode: 404 });
    return;
  }

  res.json(grievance);
});

export default router;
