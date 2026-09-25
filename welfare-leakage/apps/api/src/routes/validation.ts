import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Minimum 8 characters').max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const beneficiarySearchSchema = z.object({
  q: z.string().max(200).optional(),
  state: z.string().length(2).optional(),
  scheme: z.string().optional(),
  flagType: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const flagUpdateSchema = z.object({
  status: z.enum(['under_review', 'confirmed', 'resolved']),
  resolutionNote: z.string().max(1000).optional(),
});

export const flagBulkUpdateSchema = z.object({
  flagIds: z.array(z.string()).min(1).max(50),
  status: z.enum(['under_review', 'confirmed', 'resolved']),
  resolutionNote: z.string().max(1000).optional(),
});

export const grievanceSubmitSchema = z.object({
  aadhaarLast4: z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits'),
  schemeId: z.string().min(1),
  issueType: z.enum(['not_received', 'wrong_amount', 'dead_person', 'duplicate', 'other']),
  description: z.string().min(10, 'Minimum 10 characters').max(2000),
  otp: z.string().regex(/^\d{6}$/, '6-digit OTP'),
});
