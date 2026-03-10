import { z } from 'zod';

// Define schema for all expected environment variables. Any missing/invalid
// values cause the server to crash early with a helpful message.
const EnvSchema = z
  .object({
    PORT: z.string().optional(),
    // Accept a comma-separated list of origins so staging/preview envs work without code changes.
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    // z.coerce.number() handles string→number and rejects NaN, avoiding silent rate-limit breakage.
    RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().optional().default(15),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(100),

    // Firebase credentials — either the full JSON blob or all three individual vars must be set.
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    const hasJson = Boolean(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const hasIndividual =
      Boolean(env.FIREBASE_PROJECT_ID) &&
      Boolean(env.FIREBASE_CLIENT_EMAIL) &&
      Boolean(env.FIREBASE_PRIVATE_KEY);
    if (!hasJson && !hasIndividual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Firebase credentials are missing. Provide FIREBASE_SERVICE_ACCOUNT_JSON or all of ' +
          'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.',
      });
    }
  });

const _env = EnvSchema.parse(process.env);

export const config = {
  port: parseInt(_env.PORT ?? '3001', 10),
  // Support comma-separated origins, e.g. "https://app.com,https://staging.app.com"
  corsOrigin: _env.CORS_ORIGIN.split(',').map((s) => s.trim()),
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
