# PROJECT.md — AI Welfare Leakage Detection System

**PS Code:** SIH26202 | **Track:** Smart Automation (Software)
**Target:** MeitY/NIC — replicable for any Welfare Ministry
**Status:** Hackathon Prototype (36-hour build)

---

## 1. Problem Statement

India's welfare ecosystem disburses ₹52+ lakh crore annually via Direct Benefit
Transfer (DBT). Leakage — ghost beneficiaries, duplicate Aadhaar, dead-person
claims, ineligible recipients — remains a persistent challenge.

Manual verification doesn't scale. Existing systems flag anomalies but provide
no explainable reasoning, no officer workflow, and no citizen recourse channel.

**What we build:** An end-to-end prototype demonstrating how an ML scoring
service, an officer review workflow, and a citizen grievance portal work
together to detect, review, and resolve welfare leakage — with full audit
trail and security enforcement.

---

## 2. Two-Role Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     OFFICER / ADMIN                         │
│  (Internal — JWT Auth + RBAC)                               │
│                                                             │
│  Dashboard → Beneficiary Search → Detail → Flag Queue       │
│       ↓            ↓               ↓          ↓            │
│  KPI cards    Filters/Tables   Score gauge  Kanban          │
│  Sparklines   Anomaly badges   DBT history  Bulk actions    │
│  Heatmap      State/Scheme     Reasons      SLA chips       │
│  ML insights  Paginated        Audit trail  Resolve flow    │
│  Reports      Search                        Export CSV/PDF  │
└──────────────────────────┬──────────────────────────────────┘
                           │  Same API, different permissions
┌──────────────────────────┴──────────────────────────────────┐
│                     CITIZEN (Public)                        │
│  (No account required — OTP mock)                           │
│                                                             │
│  Submit Grievance → Upload Docs → OTP Verify → Track        │
│       ↓                ↓            ↓           ↓          │
│  Aadhaar last-4    File upload   4-digit mock  Timeline     │
│  Scheme select     Type/size     Resend timer  Status tags  │
│  Issue type        validation    5 attempts    Progress     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Scope

### Officer/Admin Portal

| Feature | Description | Status |
|---------|-------------|--------|
| Login | Role selector (Officer/Admin), JWT auth | TODO |
| Dashboard | 4 KPI cards with sparklines, recent activity | TODO |
| Beneficiary Search | Filters (State, Scheme, Flag Type), paginated table | TODO |
| Beneficiary Detail | Aadhaar last-4 only, DBT history, anomaly gauge, reasons | TODO |
| Flag Queue | Kanban (Under Review → Confirmed → Resolved), bulk actions, SLA chips | TODO |
| Anomaly Heatmap | State-wise leak density (bar-map) | TODO |
| ML Insights | Feature importance chart, precision/recall tiles, detection log | TODO |
| Reports & Export | Date range, CSV export | TODO |
| Audit Log | Officer action trail on every record | TODO |

### Citizen Portal

| Feature | Description | Status |
|---------|-------------|--------|
| Grievance Form | Aadhaar last-4, scheme, issue type, document upload, OTP | TODO |
| Grievance Tracker | Timeline (Submitted → Under Review → Resolved) | TODO |

---

## 4. Tech Stack (Justified)

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React 18 + Vite + TypeScript | Fast dev server, HMR, strong ecosystem for Recharts/Framer Motion |
| **Styling** | Tailwind CSS v3 + CSS variables | Rapid iteration, UX4G tokens via `@theme`, no CSS-in-JS overhead |
| **Charts** | Recharts | Declarative, React-native API, customizable colors |
| **Backend** | **Node.js + Express + TypeScript** | Single language across stack → faster hackathon; middleware ecosystem (helmet, rate-limit, cors) is mature; same team can fix frontend+backend bugs |
| **Relational DB** | PostgreSQL | Beneficiary/flag/audit records are relational — FK constraints enforce integrity |
| **Document DB** | MongoDB | Grievances with variable schema + file metadata |
| **Cache** | Redis (optional) | Rate limiting store, JWT blocklist |
| **Auth** | JWT (RS256) + bcrypt | Stateless, short-lived, refresh rotation |
| **ML** | Python scikit-learn (Isolation Forest) — **mocked/pre-computed** | Real model training not feasible in 36h; pre-computed scores served via API |
| **Validation** | Zod (shared between FE/BE) | Single source of truth for data contracts |

### Backend Choice: Express (not Django)

Express wins for this hackathon because:
1. **Same language as frontend** — one mental model, shared types via `@welfare/shared`
2. **Middleware chain** maps cleanly to our security layers (helmet → rate-limit → auth → validate → controller)
3. **Mock data in TypeScript** — no Python↔TS bridge needed
4. Django REST adds ORM learning curve; Express + pg is simpler for the time budget

**ML is the one Python exception** — mocked as pre-computed scores in JSON fixtures.

---

## 5. Mock vs Real Matrix

| Component | Status | Notes |
|-----------|--------|-------|
| **Beneficiary data** | MOCK | 500 synthetic records with realistic state/scheme distribution |
| **DBT transaction history** | MOCK | Generated instalment records per beneficiary |
| **ML anomaly scores** | PRE-COMPUTED | Isolation Forest logic documented; scores baked into fixtures |
| **Aadhaar verification** | MOCK | Last-4 accepted, no UIDAI API call |
| **OTP** | MOCK | Fixed code `123456` logged to console/server response |
| **File upload** | REAL | Stored to local `/uploads` (no S3 for hackathon) |
| **Authentication (JWT)** | REAL | Working RS256 tokens, refresh rotation, RBAC |
| **RBAC enforcement** | REAL | Server-side on every endpoint |
| **Audit logging** | REAL | Every officer action logged to DB |
| **Rate limiting** | REAL | express-rate-limit with memory store (Redis-ready) |
| **Input validation** | REAL | Zod schemas on every route |
| **Aadhaar masking** | REAL | API layer strips full number before response |
| **CSV export** | REAL | Streamed from API |
| **PDF export** | MOCK (later) | CSV first, PDF if time permits |

---

## 6. API Surface

### Auth
```
POST   /api/auth/login              # Email + password → access + refresh tokens
POST   /api/auth/refresh            # Refresh token → new access token
POST   /api/auth/logout             # Revoke refresh token
GET    /api/auth/me                 # Current user profile + permissions
```

### Officer (RBAC: officer, admin)
```
GET    /api/officer/dashboard       # KPI aggregates
GET    /api/officer/beneficiaries   # Paginated search + filters
GET    /api/officer/beneficiaries/:id  # Detail + DBT history + flags
GET    /api/officer/flags           # Kanban queue
PATCH  /api/officer/flags/:id       # Move status, add note
POST   /api/officer/flags/bulk      # Bulk status update
GET    /api/officer/heatmap         # State-wise anomaly density
GET    /api/officer/ml-insights     # Feature importance + metrics
GET    /api/officer/audit           # Audit log (admin only)
GET    /api/officer/reports/export  # CSV download
```

### Citizen (Public)
```
POST   /api/citizen/grievance       # Submit grievance (rate-limited 3/hr)
GET    /api/citizen/grievance/:id   # Track by ID + last-4
POST   /api/citizen/otp/send        # Send OTP (mocked)
POST   /api/citizen/otp/verify      # Verify OTP (mocked)
```

### Mock External (simulates GoI APIs)
```
GET    /api/mock/aadhaar/verify     # Mock UIDAI response
GET    /api/mock/dbt/transactions   # Mock PFMS/NPCI transactions
GET    /api/mock/schemes            # Mock scheme registry
```

---

## 7. Data Model

### PostgreSQL

```sql
-- Users (officers, admins)
users (
  id UUID PK, email UNIQUE, password_hash, role ENUM('admin','officer'),
  full_name, department, state_code, is_active, created_at, updated_at
)

-- Beneficiaries
beneficiaries (
  id UUID PK, aadhaar_hash UNIQUE, aadhaar_last4,
  full_name, gender, date_of_birth, state_code, district,
  scheme_id FK, bank_account_hash, ifsc,
  annual_income, category, is_active,
  created_at, updated_at
)

-- Schemes
schemes (
  id UUID PK, name, ministry, category, amount_per_installment,
  instalment_frequency, description, is_active
)

-- Anomaly Flags
flags (
  id UUID PK, beneficiary_id FK, flag_type ENUM(
    'duplicate_aadhaar','dead_beneficiary','income_mismatch',
    'geo_anomaly','multiple_accounts','ineligible_category'
  ),
  anomaly_score DECIMAL(5,2), confidence DECIMAL(5,2),
  reasons JSONB,              -- [{feature, contribution, explanation}]
  status ENUM('under_review','confirmed','resolved'),
  severity ENUM('high','medium','low'),
  assigned_to FK users, resolved_by FK users,
  resolution_note TEXT, resolved_at,
  sla_deadline TIMESTAMPTZ, created_at, updated_at
)

-- DBT Transactions (mock history)
dbt_transactions (
  id UUID PK, beneficiary_id FK, scheme_id FK,
  instalment_no INT, amount DECIMAL(12,2),
  status ENUM('success','failed','pending'),
  utr_number, disbursed_at, created_at
)

-- Audit Log (append-only)
audit_logs (
  id BIGSERIAL PK, actor_id FK users, actor_role,
  action VARCHAR(100),          -- 'flag.created', 'beneficiary.viewed', etc.
  resource_type VARCHAR(50),    -- 'beneficiary', 'flag', 'grievance'
  resource_id UUID,
  details JSONB,
  ip_address INET, user_agent,
  created_at TIMESTAMPTZ
)
```

### MongoDB

```javascript
// Grievances collection
{
  _id: ObjectId,
  trackingId: String,        // "GRV-2026-XXXXX"
  aadhaarLast4: String,      // 4 digits only
  schemeId: String,
  issueType: String,         // 'not_received', 'wrong_amount', 'dead_person', 'duplicate'
  description: String,
  documents: [{ filename, mimetype, size, path, uploadedAt }],
  otpVerified: Boolean,
  status: 'submitted' | 'under_review' | 'resolved',
  timeline: [
    { status, timestamp, note, updatedBy }
  ],
  createdAt, updatedAt
}
```

---

## 8. Build Phases

| Phase | Deliverable | Demoable? |
|-------|------------|-----------|
| **P0: Foundation** | Monorepo, types, config, DB schema | — |
| **P1: Auth + RBAC** | Working login, JWT, middleware | Login works |
| **P2: Mock Data** | 500 beneficiaries, flags, transactions | API responds |
| **P3: Officer Dashboard** | KPI cards, charts, tables | Dashboard demo |
| **P4: Beneficiary Flow** | Search → Detail → Flag actions | Full officer flow |
| **P5: Flag Queue** | Kanban with drag + bulk | Workflow demo |
| **P6: Citizen Portal** | Grievance form + tracker | Citizen flow demo |
| **P7: ML + Heatmap** | Insights, heatmap, export | Analytics demo |
| **P8: Polish** | Responsive, a11y, security review | Full demo |

**Partial build is demoable at every phase** — each phase adds a screen/flow,
not a big-bang integration.

---

## 9. Demo Script (3 minutes)

1. **Login as Officer** → Dashboard loads with 4 KPI cards, sparklines animate
2. **Search beneficiaries** → Filter by state + scheme, click a flagged row
3. **Detail view** → Anomaly gauge shows 87.3%, reasons explain: "Income ₹12L but claims ₹80K category"
4. **Flag queue** → Drag card from Under Review → Confirmed, add resolution note
5. **Heatmap** → Maharashtra and UP show highest leak density
6. **ML Insights** → Feature importance: income mismatch = 0.34, geo anomaly = 0.21
7. **Switch to Citizen** → Submit grievance, upload doc, OTP `123456`, track timeline
8. **Audit log** → Every officer action visible with timestamp + actor

---

## 10. File Structure

```
welfare-leakage/
├── package.json                  # Monorepo root
├── DESIGN.md                     # UX4G design system spec
├── SECURITY.md                   # Security architecture
├── PROJECT.md                    # This file
├── .env.example
├── packages/
│   └── shared/                   # Shared TypeScript types + Zod schemas
│       └── src/
│           ├── types/            # Domain types
│           ├── schemas/          # Zod validation schemas
│           └── index.ts
├── apps/
│   ├── api/                      # Express + TypeScript
│   │   ├── src/
│   │   │   ├── index.ts          # Entry point
│   │   │   ├── config/           # env, db connections
│   │   │   ├── middleware/       # auth, rbac, validate, rateLimit, audit
│   │   │   ├── routes/           # auth, officer, citizen, mock
│   │   │   ├── controllers/      # Route handlers
│   │   │   ├── services/         # Business logic, ML mock
│   │   │   ├── models/           # pg queries, mongo models
│   │   │   ├── fixtures/         # Mock data (beneficiaries, flags)
│   │   │   └── scripts/          # setup-db, seed
│   │   └── package.json
│   └── web/                      # React + Vite + Tailwind
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx           # Router setup
│       │   ├── design/           # tokens.css, tailwind.config, globals.css
│       │   ├── components/
│       │   │   ├── ui/           # Button, Input, Badge, Card, Table, Modal
│       │   │   ├── officer/      # KPICard, FlagKanban, Heatmap, Gauge
│       │   │   ├── citizen/      # GrievanceForm, Timeline, OTPInput
│       │   │   └── shared/       # Header, Footer, Layout
│       │   ├── layouts/
│       │   ├── pages/
│       │   │   ├── officer/      # Dashboard, Search, Detail, Queue, ML, Reports
│       │   │   └── citizen/      # Home, Submit, Track, Login
│       │   ├── hooks/            # useAuth, useApi, useDebounce
│       │   ├── utils/            # api client, formatters, mask helpers
│       │   └── types/
│       └── package.json
└── docs/                         # Data flow diagram, threat model
```
