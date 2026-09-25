import crypto from 'crypto';

// Deterministic pseudo-random generator for reproducible fixtures
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = seededRandom(42);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST_NAMES_M = ['Ramesh', 'Suresh', 'Mahesh', 'Arjun', 'Vijay', 'Rajesh', 'Amit', 'Deepak', 'Sanjay', 'Manoj', 'Ashok', 'Ravi', 'Suresh', 'Prakash', 'Mohammed', 'Ahmed', 'Imran', 'Karthik', 'Senthil', 'Pradeep'];
const FIRST_NAMES_F = ['Sunita', 'Lakshmi', 'Priya', 'Sita', 'Geeta', 'Anita', 'Kavita', 'Sunita', 'Rekha', 'Sushila', 'Saraswati', 'Kamala', 'Padmini', 'Divya', 'Meena', 'Fatima', 'Zoya', 'Latha', 'Revathi', 'Shobha'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Devi', 'Reddy', 'Yadav', 'Iyer', 'Gupta', 'Verma', 'Mehta', 'Nair', 'Rao', 'Choudhary', 'Mishra', 'Joshi', 'Das', 'Bose', 'Khan', 'Ansari'];

const STATES = [
  { code: 'UP', weight: 18 }, { code: 'MH', weight: 14 }, { code: 'BR', weight: 12 },
  { code: 'MP', weight: 9 }, { code: 'RJ', weight: 8 }, { code: 'WB', weight: 7 },
  { code: 'TN', weight: 6 }, { code: 'GJ', weight: 5 }, { code: 'AP', weight: 5 },
  { code: 'KA', weight: 4 }, { code: 'JH', weight: 3 }, { code: 'OD', weight: 3 },
  { code: 'KL', weight: 3 }, { code: 'TG', weight: 3 }, { code: 'CG', weight: 2 },
  { code: 'PB', weight: 2 }, { code: 'HR', weight: 2 }, { code: 'AS', weight: 2 },
  { code: 'UK', weight: 1 }, { code: 'HP', weight: 1 },
];

const DISTRICTS: Record<string, string[]> = {
  UP: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Ghaziabad'],
  MH: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Kolhapur'],
  BR: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  MP: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  RJ: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'],
  WB: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman'],
  TN: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  GJ: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'],
  AP: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool'],
  KA: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi'],
  JH: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  OD: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
  KL: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  TG: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  CG: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
  PB: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  HR: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  AS: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur'],
  UK: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani'],
  HP: ['Shimla', 'Solan', 'Dharamshala', 'Mandi'],
};

const SCHEMES = [
  { id: 'pm-kisan', name: 'PM-KISAN', ministry: 'Ministry of Agriculture', category: 'Farmers', amount: 2000, freq: 'quarterly' as const },
  { id: 'ayushman', name: 'Ayushman Bharat', ministry: 'Ministry of Health', category: 'Health', amount: 500000, freq: 'yearly' as const },
  { id: 'nsgpy', name: 'NSAP — Old Age Pension', ministry: 'Ministry of Rural Development', category: 'Pension', amount: 500, freq: 'monthly' as const },
  { id: 'midday', name: 'Mid-Day Meal', ministry: 'Ministry of Education', category: 'Nutrition', amount: 150, freq: 'monthly' as const },
  { id: 'jaljeevan', name: 'PM-Jal Jeevan Mission', ministry: 'Ministry of Jal Shakti', category: 'Water', amount: 15000, freq: 'yearly' as const },
  { id: 'ujjwala', name: 'Ujjwala Yojana', ministry: 'Ministry of Petroleum', category: 'LPG', amount: 1600, freq: 'yearly' as const },
];

const FLAG_TYPES = ['duplicate_aadhaar', 'dead_beneficiary', 'income_mismatch', 'geo_anomaly', 'multiple_accounts', 'ineligible_category'] as const;

// Weighted state picker
function pickState(): string {
  const totalWeight = STATES.reduce((s, st) => s + st.weight, 0);
  let r = rand() * totalWeight;
  for (const st of STATES) {
    r -= st.weight;
    if (r <= 0) return st.code;
  }
  return 'UP';
}

// Generate Aadhaar last-4
const last4 = () => String(randInt(1000, 9999));

// Generate income with realistic distribution
function genIncome(): number {
  const r = rand();
  if (r < 0.4) return randInt(50000, 300000);       // Low income
  if (r < 0.7) return randInt(300000, 800000);       // Lower middle
  if (r < 0.9) return randInt(800000, 1500000);      // Middle
  return randInt(1500000, 5000000);                   // Upper
}

interface RawBeneficiary {
  id: string;
  aadhaarLast4: string;
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

function generateBeneficiaries(count: number): RawBeneficiary[] {
  const beneficiaries: RawBeneficiary[] = [];

  for (let i = 0; i < count; i++) {
    const state = pickState();
    const districts = DISTRICTS[state] || ['District'];
    const gender: 'M' | 'F' = rand() < 0.5 ? 'M' : 'F';
    const scheme = pick(SCHEMES);
    const name = gender === 'M' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    const fullName = `${name} ${pick(LAST_NAMES)}`;
    const income = genIncome();

    // ~20% of beneficiaries have flags
    const hasFlag = rand() < 0.2;
    const flagCount = hasFlag ? randInt(1, 3) : 0;
    const maxScore = hasFlag ? randInt(45, 98) : 0;

    beneficiaries.push({
      id: `ben-${String(i + 1).padStart(5, '0')}`,
      aadhaarLast4: last4(),
      fullName,
      gender,
      dateOfBirth: `${randInt(1955, 2005)}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      stateCode: state,
      district: pick(districts),
      schemeId: scheme.id,
      schemeName: scheme.name,
      annualIncome: income,
      category: rand() < 0.05 ? 'sc' : rand() < 0.1 ? 'st' : rand() < 0.4 ? 'obc' : 'general',
      bankAccountLast4: last4(),
      ifsc: `HDFC${String(randInt(1, 99999)).padStart(7, '0')}`,
      isActive: rand() < 0.95,
      flagCount,
      maxAnomalyScore: maxScore,
      createdAt: new Date(Date.now() - randInt(180, 1095) * 86400000).toISOString(),
    });
  }

  return beneficiaries;
}

interface RawFlag {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  aadhaarLast4: string;
  stateCode: string;
  schemeName: string;
  flagType: string;
  anomalyScore: number;
  confidence: number;
  reasons: { feature: string; contribution: number; explanation: string }[];
  status: 'under_review' | 'confirmed' | 'resolved';
  severity: 'high' | 'medium' | 'low';
  assignedTo: string | null;
  assignedToName: string | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
}

const REASON_TEMPLATES: Record<string, { feature: string; explanation: string }[]> = {
  income_mismatch: [
    { feature: 'Annual income', explanation: 'Reported income exceeds scheme eligibility threshold' },
    { feature: 'ITR filing', explanation: 'Income tax return filed with income > ₹8 lakh' },
    { feature: 'Bank balance', explanation: 'Average bank balance inconsistent with declared income' },
  ],
  duplicate_aadhaar: [
    { feature: 'Aadhaar match', explanation: 'Same Aadhaar linked to multiple beneficiary records' },
    { feature: 'Name similarity', explanation: '94% name similarity with another active beneficiary' },
    { feature: 'Mobile number', explanation: 'Shared mobile number across different beneficiaries' },
  ],
  dead_beneficiary: [
    { feature: 'Death record', explanation: 'Match found in state death registry' },
    { feature: 'Aadhaar status', explanation: 'Aadhaar marked as deceased in mock UIDAI response' },
    { feature: 'Last activity', explanation: 'No biometric or login activity for 14+ months' },
  ],
  geo_anomaly: [
    { feature: 'IP location', explanation: 'Login geolocation differs from registered state' },
    { feature: 'Disbursement location', explanation: 'ATM withdrawal in different state within 1 hour of credit' },
    { feature: 'Aadhaar KYC', explanation: 'Last KYC update location far from registered address' },
  ],
  multiple_accounts: [
    { feature: 'Account count', explanation: '3 bank accounts linked to same Aadhaar in different banks' },
    { feature: 'IFSC diversity', explanation: 'Multiple IFSC codes associated with single beneficiary' },
    { feature: 'Simultaneous credits', explanation: 'Same amount credited to multiple accounts simultaneously' },
  ],
  ineligible_category: [
    { feature: 'Category mismatch', explanation: 'Declared category differs from certificate verification' },
    { feature: 'Income certificate', explanation: 'Income certificate expired or under verification' },
    { feature: 'Employment status', explanation: 'Government employee detected — scheme not applicable' },
  ],
};

function generateFlags(beneficiaries: RawBeneficiary[]): RawFlag[] {
  const flags: RawFlag[] = [];
  const flaggedBeneficiaries = beneficiaries.filter((b) => b.flagCount > 0);
  let flagIndex = 1;

  for (const ben of flaggedBeneficiaries) {
    for (let f = 0; f < ben.flagCount; f++) {
      const flagType = pick([...FLAG_TYPES]);
      const score = Math.min(98, ben.maxAnomalyScore - f * 5 + randInt(-3, 3));
      const confidence = 0.7 + rand() * 0.28;
      const statusRand = rand();
      const status = statusRand < 0.5 ? 'under_review' : statusRand < 0.8 ? 'confirmed' : 'resolved';
      const severity = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
      const createdAt = new Date(Date.now() - randInt(1, 30) * 86400000);
      const slaHours = severity === 'high' ? 24 : severity === 'medium' ? 48 : 72;
      const slaDeadline = new Date(createdAt.getTime() + slaHours * 3600000);

      const templates = REASON_TEMPLATES[flagType] || [];
      const selectedReasons = templates.map((t) => ({
        feature: t.feature,
        contribution: Math.round(rand() * 30 + 10) / 100,
        explanation: t.explanation,
      }));

      flags.push({
        id: `flag-${String(flagIndex).padStart(5, '0')}`,
        beneficiaryId: ben.id,
        beneficiaryName: ben.fullName,
        aadhaarLast4: ben.aadhaarLast4,
        stateCode: ben.stateCode,
        schemeName: ben.schemeName,
        flagType,
        anomalyScore: Math.max(40, score),
        confidence: Math.round(confidence * 100) / 100,
        reasons: selectedReasons,
        status,
        severity,
        assignedTo: rand() < 0.5 ? 'officer-1' : null,
        assignedToName: rand() < 0.5 ? 'Officer Priya Sharma' : null,
        resolutionNote: status === 'resolved' ? pick([
          'Verified with district officer — records updated.',
          'Confirmed leakage — amount recovered.',
          'False positive — beneficiary documents verified.',
          'Transferred to state monitoring cell.',
        ]) : null,
        resolvedBy: status === 'resolved' ? 'officer-1' : null,
        resolvedAt: status === 'resolved' ? new Date(createdAt.getTime() + randInt(4, 48) * 3600000).toISOString() : null,
        slaDeadline: slaDeadline.toISOString(),
        createdAt: createdAt.toISOString(),
        updatedAt: createdAt.toISOString(),
      });
      flagIndex++;
    }
  }

  return flags;
}

function generateTransactions(beneficiary: RawBeneficiary): { id: string; beneficiaryId: string; instalmentNo: number; amount: number; status: string; utrNumber: string; disbursedAt: string }[] {
  const scheme = SCHEMES.find((s) => s.id === beneficiary.schemeId) || SCHEMES[0];
  const txnCount = randInt(3, 8);
  const txns = [];

  for (let i = 0; i < txnCount; i++) {
    const disbursedAt = new Date(Date.now() - (i * 90 + randInt(0, 30)) * 86400000);
    txns.push({
      id: `txn-${beneficiary.id}-${i}`,
      beneficiaryId: beneficiary.id,
      instalmentNo: txnCount - i,
      amount: scheme.amount,
      status: rand() < 0.9 ? 'success' : rand() < 0.5 ? 'failed' : 'pending',
      utrNumber: `UTR${disbursedAt.getFullYear()}${String(disbursedAt.getMonth() + 1).padStart(2, '0')}${String(disbursedAt.getDate()).padStart(2, '0')}${randInt(1000, 9999)}`,
      disbursedAt: disbursedAt.toISOString(),
    });
  }
  return txns;
}

// Generate all fixtures
export const beneficiaries = generateBeneficiaries(500);
export const flags = generateFlags(beneficiaries);
export const transactions = beneficiaries.flatMap(generateTransactions);

// Hash Aadhaar (never store full number)
export function hashAadhaar(aadhaar: string, salt: string): string {
  return crypto.createHash('sha256').update(salt + aadhaar).digest('hex');
}
