import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY_BASE64 || '',
    publicKey: process.env.JWT_PUBLIC_KEY_BASE64 || '',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  aadhaarSalt: process.env.Aadhaar_HASH_SALT || 'dev-salt-change-me',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  },
  mockOtp: process.env.MOCK_OTP_CODE || '123456',
};
