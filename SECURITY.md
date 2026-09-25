# SECURITY.md — Welfare Leakage Detection System
## Security Architecture & Threat Model

---

## 1. Trust Boundaries & Data Flow

```
┌─────────────────┐     HTTPS/TLS 1.3      ┌─────────────────┐
│   Citizen       │ ◄────────────────────► │   API Gateway   │
│   Portal (FE)   │                        │   (Nginx/Cloud) │
└─────────────────┘                        └────────┬────────┘
                                                     │
                        ┌────────────────────────────┼────────────────────────────┐
                        │                            │                            │
                        ▼                            ▼                            ▼
               ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
               │  Auth Service   │          │  Officer API    │          │  Citizen API    │
               │  (JWT/RBAC)     │          │  (Admin/Officer)│          │  (Grievance)    │
               └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
                        │                            │                            │
                        └────────────────────────────┼────────────────────────────┘
                                                     │
                        ┌────────────────────────────┼────────────────────────────┐
                        │                            │                            │
                        ▼                            ▼                            ▼
               ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
               │  PostgreSQL     │          │   MongoDB       │          │     Redis       │
               │  (Beneficiaries,│          │  (Grievances,   │          │  (Cache, Rate   │
               │   Flags, Audit) │          │   Documents)    │          │   Limit, Session)│
               └─────────────────┘          └─────────────────┘          └─────────────────┘
```

**Trust Zones:**
1. **Public Internet** — Citizen portal, grievance submission
2. **DMZ / API Gateway** — TLS termination, rate limiting, WAF
3. **Application Tier** — Stateless API servers (horizontal scaling)
4. **Data Tier** — Encrypted at rest, network-isolated, least-privilege DB users

---

## 2. Authentication & Authorization

### 2.1 JWT Implementation

```typescript
// Token Structure
interface AccessTokenPayload {
  sub: string;           // User ID
  role: 'admin' | 'officer' | 'citizen';
  permissions: string[]; // Fine-grained: ['beneficiary:read', 'flag:write', ...]
  iat: number;
  exp: number;           // 15 min expiry
  jti: string;           // Unique token ID for revocation
}

interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  exp: number;           // 7 days
  jti: string;
  family: string;        // Rotation family ID
}
```

**Security Properties:**
- **RS256** asymmetric signing (private key never leaves auth service)
- **Short-lived access tokens** (15 min) + **rotating refresh tokens** (7 days)
- **Token binding** to device fingerprint (UA + IP prefix) — optional for hackathon
- **Revocation list** in Redis (jti blocklist) for logout/compromise
- **No sensitive data in payload** — only identifiers and permissions

### 2.2 Role-Based Access Control (RBAC)

| Role | Permissions | Endpoints |
|------|-------------|-----------|
| **Admin** | `*`:all | All officer + user management, system config |
| **Officer** | `beneficiary:read`, `beneficiary:search`, `flag:read`, `flag:write`, `flag:resolve`, `grievance:read`, `report:export` | `/api/officer/*` |
| **Citizen** | `grievance:create`, `grievance:read:self`, `profile:read:self` | `/api/citizen/*` |

**Enforcement:**
- **Middleware on every route** — `requireAuth()`, `requireRole()`, `requirePermission()`
- **Never UI-only** — API returns 403 if permission missing
- **Resource-level checks** — Officer can only access beneficiaries in assigned state/district

### 2.3 Password & Credential Security

- **bcrypt** with cost factor 12 (configurable via env)
- **No password storage for citizens** — OTP-only auth (mocked)
- **Officer/Admin** — Password + future MFA ready (TOTP)
- **Secrets**: All in env vars, never committed. `.env.example` provided.

---

## 3. Input Validation & Injection Prevention

### 3.1 Validation Layers

```
Request → Helmet (headers) → Rate Limit → Body Parser (size limit)
  → Zod Schema Validation (per route) → Controller → Service
  → Parameterized Queries (pg) / Mongoose (sanitized) → DB
```

### 3.2 Rules Per Endpoint Type

| Endpoint | Validation |
|----------|------------|
| **Auth** | Strict email/phone format, password min 12 chars, rate limit 5/min |
| **Beneficiary Search** | Allowlist filters (state, scheme, flagType), pagination max 100 |
| **Flag Actions** | Enum flagStatus, UUID beneficiaryId, audit reason required |
| **Grievance Submit** | Aadhaar last-4 regex `^\d{4}$`, file type/size allowlist, OTP format |
| **Export** | Date range max 1 year, format enum (csv/pdf) |

### 3.3 SQL/NoSQL Injection

- **PostgreSQL**: Only parameterized queries via `pg` — **zero string concatenation**
- **MongoDB**: Mongoose schemas with strict mode, no `where` clauses with user input
- **Redis**: Key prefixes namespaced, no user input in key construction

---

## 4. Aadhaar Data Protection

### 4.1 Masking Enforcement (API Layer)

```typescript
// NEVER stored or returned in full
interface BeneficiaryRecord {
  aadhaarHash: string;        // SHA-256(salt + full_aadhaar) — for dedup only
  aadhaarLast4: string;       // "XXXX-XXXX-1234" — ONLY field ever returned
  // ... other fields
}

// API Response Transformer
function maskBeneficiary(b: BeneficiaryRecord): PublicBeneficiary {
  return {
    ...b,
    aadhaar: `XXXX-XXXX-${b.aadhaarLast4}`,  // Frontend never sees more
    aadhaarHash: undefined,                    // Stripped
    aadhaarLast4: undefined                    // Stripped
  };
}
```

### 4.2 Data Handling Rules

- **Full Aadhaar NEVER** in logs, DB, API responses, frontend state
- **Mock data only** — fixtures use synthetic 12-digit numbers, last-4 extracted
- **Hash salt** rotated per deployment (stored in secret manager)
- **Audit log** records `aadhaarHash` only for traceability

---

## 5. Rate Limiting & DoS Protection

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `POST /auth/login` | 5 | 1 min | IP |
| `POST /auth/refresh` | 10 | 1 min | IP + user |
| `POST /citizen/grievance` | 3 | 1 hour | IP + Aadhaar last-4 |
| `GET /officer/beneficiaries` | 60 | 1 min | User ID |
| `POST /officer/flags/bulk` | 10 | 1 min | User ID |
| **Global** | 200 | 1 min | IP |

**Implementation:** `express-rate-limit` with Redis store, sliding window.

---

## 6. Security Headers (Helmet + Custom)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],           // No inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind needs inline
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.API_URL],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }
}));

// Additional
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});
```

---

## 7. Audit Logging

### 7.1 Events Logged (Immutable Append-Only)

| Event | Fields |
|-------|--------|
| `AUTH_LOGIN` | userId, role, ip, userAgent, success, timestamp |
| `AUTH_LOGOUT` | userId, jti, timestamp |
| `BENEFICIARY_VIEW` | officerId, beneficiaryId, aadhaarHash, timestamp |
| `FLAG_CREATED` | officerId, beneficiaryId, flagType, score, reason, timestamp |
| `FLAG_RESOLVED` | officerId, flagId, resolution, timestamp |
| `GRIEVANCE_SUBMITTED` | citizenId (hashed), scheme, issueType, timestamp |
| `EXPORT_GENERATED` | officerId, dateRange, format, recordCount, timestamp |
| `PERMISSION_DENIED` | userId, requiredPerm, actualPerms, endpoint, timestamp |

### 7.2 Log Security

- **Winston** with structured JSON, shipped to secure log aggregation
- **No PII** in logs — Aadhaar hashed, names truncated
- **Tamper-evident** — Hash chain (each entry includes prev hash)
- **Retention**: 7 years (compliance), then secure deletion

---

## 8. CORS & Network Policies

```typescript
// CORS — Explicit allowlist only
const corsOptions = {
  origin: [
    'https://citizen.welfare.gov.in',
    'https://officer.welfare.gov.in',
    'http://localhost:5173',  // Dev only
    'http://localhost:3000'   // Dev only
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400
};
```

**Network:**
- API only accessible via API Gateway (no direct public exposure)
- Database ports closed to world (security groups)
- Redis bound to localhost + API server IPs only

---

## 9. OWASP Top 10 Mitigation Status

| # | Risk | Mitigation | Status |
|---|------|------------|--------|
| A01 | Broken Access Control | RBAC middleware + resource checks | ✅ Enforced |
| A02 | Cryptographic Failures | TLS 1.3, bcrypt, RS256, encrypted DB | ✅ Enforced |
| A03 | Injection | Zod + parameterized queries + Mongoose | ✅ Enforced |
| A04 | Insecure Design | Threat model, secure defaults, least privilege | ✅ Designed |
| A05 | Security Misconfiguration | Helmet, explicit CORS, no debug endpoints | ✅ Enforced |
| A06 | Vulnerable Components | `npm audit`, Dependabot, pinned versions | 🔄 CI/CD |
| A07 | Auth Failures | Short JWT, rotating refresh, rate limit, MFA-ready | ✅ Enforced |
| A08 | Software Integrity | Signed deploys, SBOM, checksum verification | 🔄 CI/CD |
| A09 | Logging Failures | Structured audit logs, immutable, monitored | ✅ Enforced |
| A10 | SSRF | No outbound requests from user input | ✅ Enforced |

---

## 10. Hackathon Trade-offs (Documented)

| Area | Trade-off | Risk | Mitigation for Demo |
|------|-----------|------|---------------------|
| **MFA** | Not implemented | Officer account takeover | Documented, TOTP scaffold ready |
| **WAF** | Not deployed | Advanced injection bypass | Helmet + validation covers OWASP Top 10 |
| **Secrets Manager** | `.env` file used | Secret leakage in repo | `.gitignore`, `.env.example` only |
| **Token Binding** | IP+UA only, no device cert | Token replay | Short 15-min expiry limits window |
| **Encryption at Rest** | Mock DB, not encrypted | Data exposure if DB dumped | Documented, pgcrypto/Mongo encryption ready |
| **Penetration Test** | Not performed | Unknown vulns | Code review + SAST in CI |
| **Incident Response** | No runbook | Slow breach response | Audit log provides forensic trail |

---

## 11. Deployment Security Checklist

- [ ] TLS 1.3 enforced (HSTS preload)
- [ ] All secrets in vault/manager (not `.env`)
- [ ] Database: SSL required, cert verification
- [ ] Redis: AUTH enabled, TLS in production
- [ ] API Gateway: WAF rules (OWASP CRS)
- [ ] Logging: Centralized, alerting on `PERMISSION_DENIED` spikes
- [ ] Backup: Encrypted, tested restore, 30-day retention
- [ ] Monitoring: Uptime, error rate, latency, auth failures
- [ ] Dependencies: `npm audit` clean, SBOM generated

---

## 12. Incident Response Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Security Lead | security@welfare.gov.in | Immediate |
| DBA | dba@welfare.gov.in | 15 min |
| DevOps | devops@welfare.gov.in | 15 min |
| Legal/Compliance | legal@welfare.gov.in | 1 hour |

---

*Last Updated: 2024 | Version 1.0 | For Hackathon Prototype — Production hardening required*