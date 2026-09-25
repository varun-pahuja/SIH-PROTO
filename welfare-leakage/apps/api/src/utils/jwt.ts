import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Generate a key pair if not provided (for demo)
let privateKey: string;
let publicKey: string;

if (config.jwt.privateKey && config.jwt.publicKey) {
  privateKey = Buffer.from(config.jwt.privateKey, 'base64').toString('utf-8');
  publicKey = Buffer.from(config.jwt.publicKey, 'base64').toString('utf-8');
} else {
  const { privateKey: pk, publicKey: pub } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  privateKey = pk;
  publicKey = pub;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: 'admin' | 'officer' | 'citizen';
  permissions: string[];
  jti: string;
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  jti: string;
  family: string;
}

export function signAccessToken(payload: Omit<AccessTokenPayload, 'jti'>): string {
  return jwt.sign({ ...payload }, privateKey, {
    algorithm: 'RS256',
    expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
    jwtid: crypto.randomUUID(),
  });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'jti'>): string {
  return jwt.sign({ ...payload }, privateKey, {
    algorithm: 'RS256',
    expiresIn: config.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
    jwtid: crypto.randomUUID(),
  });
}

export function verifyToken(token: string): AccessTokenPayload | RefreshTokenPayload {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as AccessTokenPayload | RefreshTokenPayload;
}
