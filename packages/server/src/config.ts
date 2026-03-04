import { z } from 'zod';

// Define schema for all expected environment variables. Any missing/invalid
// values cause the server to crash early with a helpful message.
const EnvSchema = z.object({
  PORT: z.string().optional(),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MINUTES: z
    .string()
    .transform((s) => parseInt(s, 10))
    .optional()
    .default(15),
  RATE_LIMIT_MAX: z
    .string()
    .transform((s) => parseInt(s, 10))
    .optional()
    .default(100),

  // Firebase credentials - one of two options should be provided.
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
});

const _env = EnvSchema.parse(process.env);

export const config = {
  port: parseInt(_env.PORT ?? '3001', 10),
  corsOrigin: _env.CORS_ORIGIN,
  rateLimit: {
    windowMs: _env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    max: _env.RATE_LIMIT_MAX,
  },
  firebase: {
    projectId: _env.FIREBASE_PROJECT_ID,
    clientEmail: _env.FIREBASE_CLIENT_EMAIL,
    privateKey: _env.FIREBASE_PRIVATE_KEY,
    serviceAccountJson: _env.FIREBASE_SERVICE_ACCOUNT_JSON,
  },
};
