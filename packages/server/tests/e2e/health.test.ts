/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

// prevent firebase-admin from initialising during app import
vi.mock('../../src/firebase', () => ({ default: {} }));
vi.mock('../../src/repositories/userRepository', () => ({
  verifyIdToken: vi.fn(),
}));

import request from 'supertest';
import { createApp } from '../../src/app';

describe('e2e /api/health', () => {
  it('returns 200 with status ok', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});
