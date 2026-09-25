import rateLimit from 'express-rate-limit';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 60000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Too many requests, please try again later', statusCode: 429 },
});

// Auth endpoints — strict
export const authLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Too many login attempts, please wait a minute', statusCode: 429 },
});

// Grievance submission — very strict (prevent spam)
export const grievanceLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Maximum 3 grievance submissions per hour', statusCode: 429 },
});

// Officer search — moderate
export const officerLimiter = rateLimit({
  windowMs: 60000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Rate limit exceeded', statusCode: 429 },
});
