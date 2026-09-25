export type Role = 'admin' | 'officer' | 'citizen';

export type FlagType =
  | 'duplicate_aadhaar'
  | 'dead_beneficiary'
  | 'income_mismatch'
  | 'geo_anomaly'
  | 'multiple_accounts'
  | 'ineligible_category';

export type FlagStatus = 'under_review' | 'confirmed' | 'resolved';

export type Severity = 'high' | 'medium' | 'low';

export type GrievanceStatus = 'submitted' | 'under_review' | 'resolved';

export type IssueType =
  | 'not_received'
  | 'wrong_amount'
  | 'dead_person'
  | 'duplicate'
  | 'other';

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  department: string;
  stateCode: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  category: string;
  amountPerInstallment: number;
  instalmentFrequency: 'monthly' | 'quarterly' | 'yearly';
}

export interface Beneficiary {
  id: string;
  aadhaarLast4: string; // API returns ONLY last 4
  fullName: string;
  gender: 'M' | 'F' | 'O';
  dateOfBirth: string;
  stateCode: string;
  district: string;
  schemeId: string;
  schemeName: string;
  annualIncome: number;
  category: 'general' | 'obc' | 'sc' | 'st';
  bankAccountLast4: string;
  ifsc: string;
  isActive: boolean;
  flagCount: number;
  maxAnomalyScore: number;
  createdAt: string;
}

export interface BeneficiaryDetail extends Beneficiary {
  dbtTransactions: DBTTransaction[];
  flags: Flag[];
  reasons: FlagReason[];
}

export interface DBTTransaction {
  id: string;
  instalmentNo: number;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  utrNumber: string;
  disbursedAt: string;
}

export interface FlagReason {
  feature: string;
  contribution: number;
  explanation: string;
}

export interface Flag {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  aadhaarLast4: string;
  stateCode: string;
  schemeName: string;
  flagType: FlagType;
  anomalyScore: number;
  confidence: number;
  reasons: FlagReason[];
  status: FlagStatus;
  severity: Severity;
  assignedTo: string | null;
  assignedToName: string | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface DashboardKPIs {
  totalBeneficiaries: number;
  flaggedToday: number;
  resolvedThisWeek: number;
  pendingGrievances: number;
  sparklineFlagged: number[];
  sparklineResolved: number[];
  sparklineGrievances: number[];
}

export interface HeatmapEntry {
  stateCode: string;
  stateName: string;
  flagCount: number;
  avgAnomalyScore: number;
  beneficiaries: number;
  leakRate: number;
}

export interface MLInsights {
  featureImportance: { feature: string; importance: number }[];
  metrics: {
    precision: number;
    recall: number;
    f1: number;
    auc: number;
    samplesTrained: number;
  };
  recentDetections: {
    id: string;
    beneficiaryName: string;
    flagType: FlagType;
    score: number;
    detectedAt: string;
  }[];
}

export interface Grievance {
  trackingId: string;
  aadhaarLast4: string;
  schemeId: string;
  schemeName: string;
  issueType: IssueType;
  description: string;
  status: GrievanceStatus;
  otpVerified: boolean;
  documents: {
    filename: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }[];
  timeline: {
    status: GrievanceStatus;
    timestamp: string;
    note: string;
    updatedBy: string;
  }[];
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
