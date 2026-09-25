import { Request } from 'express';

interface AuditEntry {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// In-memory audit log (production: PostgreSQL append-only table)
const auditLog: AuditEntry[] = [];

export function logAudit(
  req: Request,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, unknown> = {}
) {
  const entry: AuditEntry = {
    actorId: req.user?.sub || 'anonymous',
    actorRole: req.user?.role || 'unknown',
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    timestamp: new Date().toISOString(),
  };
  auditLog.push(entry);

  // Also log to console for demo visibility
  console.log(`[AUDIT] ${entry.timestamp} ${entry.actorRole}:${entry.actorId} → ${action} ${resourceType}:${resourceId}`);
}

export function getAuditLog(limit = 100): AuditEntry[] {
  return auditLog.slice(-limit).reverse();
}
