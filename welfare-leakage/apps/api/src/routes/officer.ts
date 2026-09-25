import { Router, Request, Response } from 'express';
import { beneficiaries, flags, transactions } from '../fixtures/data.js';
import { requireAuth, requireRole, requirePermission } from '../middleware/auth.js';
import { validateQuery, validateBody } from '../middleware/validate.js';
import { logAudit, getAuditLog } from '../middleware/audit.js';
import { officerLimiter } from '../middleware/rateLimit.js';
import { beneficiarySearchSchema, flagUpdateSchema, flagBulkUpdateSchema } from './validation.js';
import { STATE_NAMES } from '../constants.js';

const router = Router();

// All officer routes require auth + officer/admin role
router.use(requireAuth);
router.use(requireRole('officer', 'admin'));
router.use(officerLimiter);

// GET /officer/dashboard — KPI aggregates
router.get('/dashboard', (_req: Request, res: Response) => {
  const flaggedToday = flags.filter((f) => {
    const d = new Date(f.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const resolvedThisWeek = flags.filter((f) => {
    if (!f.resolvedAt) return false;
    const d = new Date(f.resolvedAt);
    const weekAgo = Date.now() - 7 * 86400000;
    return d.getTime() > weekAgo;
  }).length;

  // Generate sparkline data (last 7 days)
  const sparklineFlagged = Array.from({ length: 7 }, (_, i) => {
    const day = Date.now() - (6 - i) * 86400000;
    const dayStr = new Date(day).toDateString();
    return flags.filter((f) => new Date(f.createdAt).toDateString() === dayStr).length;
  });

  const sparklineResolved = Array.from({ length: 7 }, (_, i) => {
    const day = Date.now() - (6 - i) * 86400000;
    const dayStr = new Date(day).toDateString();
    return flags.filter((f) => f.resolvedAt && new Date(f.resolvedAt).toDateString() === dayStr).length;
  });

  res.json({
    totalBeneficiaries: beneficiaries.length,
    flaggedToday,
    resolvedThisWeek,
    pendingGrievances: 14, // Mock — from MongoDB in production
    sparklineFlagged: sparklineFlagged.length ? sparklineFlagged : [5, 8, 12, 9, 15, 11, 8],
    sparklineResolved: sparklineResolved.length ? sparklineResolved : [3, 5, 7, 4, 8, 6, 5],
    sparklineGrievances: [5, 8, 6, 9, 7, 12, 14],
  });
});

// GET /officer/beneficiaries — paginated search + filters
router.get('/beneficiaries', validateQuery(beneficiarySearchSchema), (req: Request, res: Response) => {
  const { q, state, scheme, flagType, page, pageSize } = req.query as any;

  let filtered = [...beneficiaries];

  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (b) => b.fullName.toLowerCase().includes(query) || b.aadhaarLast4.includes(query)
    );
  }
  if (state) filtered = filtered.filter((b) => b.stateCode === state);
  if (scheme) filtered = filtered.filter((b) => b.schemeId === scheme);
  if (flagType) {
    const flaggedIds = flags.filter((f) => f.flagType === flagType).map((f) => f.beneficiaryId);
    filtered = filtered.filter((b) => flaggedIds.includes(b.id));
  }

  // Sort by anomaly score descending
  filtered.sort((a, b) => b.maxAnomalyScore - a.maxAnomalyScore);

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  res.json({ data, total, page, pageSize, totalPages });
});

// GET /officer/beneficiaries/:id — detail + DBT history + flags
router.get('/beneficiaries/:id', requirePermission('beneficiary:read'), (req: Request, res: Response) => {
  const { id } = req.params;
  const ben = beneficiaries.find((b) => b.id === id);
  if (!ben) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Beneficiary not found', statusCode: 404 });
    return;
  }

  logAudit(req, 'beneficiary.viewed', 'beneficiary', id);

  const benFlags = flags.filter((f) => f.beneficiaryId === id);
  const benTxns = transactions.filter((t) => t.beneficiaryId === id);

  // Build reasons from flags (merged)
  const reasons = benFlags.length > 0 ? benFlags[0].reasons : [];

  res.json({
    ...ben,
    dbtTransactions: benTxns,
    flags: benFlags,
    reasons,
  });
});

// GET /officer/flags — Kanban queue
router.get('/flags', (req: Request, res: Response) => {
  const limit = parseInt((req.query.limit as string) || '100', 10);
  const status = req.query.status as string | undefined;

  let filtered = [...flags].sort((a, b) => b.anomalyScore - a.anomalyScore);
  if (status) filtered = filtered.filter((f) => f.status === status);

  res.json({
    data: filtered.slice(0, limit),
    total: filtered.length,
  });
});

// PATCH /officer/flags/:id — update status
router.patch('/flags/:id', validateBody(flagUpdateSchema), (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, resolutionNote } = req.body;
  const flag = flags.find((f) => f.id === id);

  if (!flag) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Flag not found', statusCode: 404 });
    return;
  }

  flag.status = status;
  flag.updatedAt = new Date().toISOString();
  if (resolutionNote) flag.resolutionNote = resolutionNote;
  if (status === 'resolved') {
    flag.resolvedBy = req.user!.sub;
    flag.resolvedAt = new Date().toISOString();
  }

  logAudit(req, 'flag.status_changed', 'flag', id, { from: flag.status, to: status });
  res.json(flag);
});

// POST /officer/flags/bulk — bulk status update
router.post('/flags/bulk', validateBody(flagBulkUpdateSchema), (req: Request, res: Response) => {
  const { flagIds, status, resolutionNote } = req.body;
  let updated = 0;

  for (const id of flagIds) {
    const flag = flags.find((f) => f.id === id);
    if (flag) {
      flag.status = status;
      flag.updatedAt = new Date().toISOString();
      if (resolutionNote) flag.resolutionNote = resolutionNote;
      if (status === 'resolved') {
        flag.resolvedBy = req.user!.sub;
        flag.resolvedAt = new Date().toISOString();
      }
      updated++;
      logAudit(req, 'flag.bulk_updated', 'flag', id, { status });
    }
  }

  res.json({ updated, total: flagIds.length });
});

// GET /officer/heatmap — state-wise anomaly density
router.get('/heatmap', requirePermission('heatmap:read'), (_req: Request, res: Response) => {
  const stateData = Object.entries(STATE_NAMES).map(([code, name]) => {
    const stateBens = beneficiaries.filter((b) => b.stateCode === code);
    const stateFlags = flags.filter((f) => f.stateCode === code);
    const avgScore = stateFlags.length
      ? stateFlags.reduce((s, f) => s + f.anomalyScore, 0) / stateFlags.length
      : 0;

    return {
      stateCode: code,
      stateName: name,
      flagCount: stateFlags.length,
      avgAnomalyScore: Math.round(avgScore * 10) / 10,
      beneficiaries: stateBens.length,
      leakRate: stateBens.length > 0 ? Math.round((stateFlags.length / stateBens.length) * 1000) / 1000 : 0,
    };
  });

  // Only return states with beneficiaries
  res.json(stateData.filter((s) => s.beneficiaries > 0).sort((a, b) => b.leakRate - a.leakRate));
});

// GET /officer/ml-insights — model metrics + feature importance
router.get('/ml-insights', requirePermission('ml:read'), (_req: Request, res: Response) => {
  const recentFlags = [...flags].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  res.json({
    featureImportance: [
      { feature: 'Income Mismatch', importance: 0.34 },
      { feature: 'Geo Anomaly', importance: 0.21 },
      { feature: 'Duplicate Aadhaar', importance: 0.18 },
      { feature: 'Account Age', importance: 0.12 },
      { feature: 'Transaction Pattern', importance: 0.08 },
      { feature: 'Category Eligibility', importance: 0.07 },
    ],
    metrics: {
      precision: 0.91,
      recall: 0.87,
      f1: 0.89,
      auc: 0.94,
      samplesTrained: beneficiaries.length,
    },
    recentDetections: recentFlags.map((f) => ({
      id: f.id,
      beneficiaryName: f.beneficiaryName,
      flagType: f.flagType,
      score: f.anomalyScore,
      detectedAt: f.createdAt,
    })),
  });
});

// GET /officer/audit — audit log (admin only)
router.get('/audit', requireRole('admin'), (_req: Request, res: Response) => {
  res.json(getAuditLog(200));
});

// GET /officer/reports/export — CSV download
router.get('/reports/export', requirePermission('report:export'), (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };

  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to + 'T23:59:59') : new Date();

  const filtered = flags.filter((f) => {
    const d = new Date(f.createdAt);
    return d >= fromDate && d <= toDate;
  });

  // Build CSV
  const header = 'beneficiary_name,state,scheme,flag_type,anomaly_score,confidence,status,detected_at';
  const rows = filtered.map((f) =>
    [f.beneficiaryName, f.stateCode, f.schemeName, f.flagType, f.anomalyScore, f.confidence, f.status, f.createdAt].join(',')
  );
  const csv = [header, ...rows].join('\n');

  logAudit(req, 'report.exported', 'report', `flags-${from}-${to}`, { recordCount: filtered.length });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="welfare-report-${from}-to-${to}.csv"`);
  res.send(csv);
});

export default router;
