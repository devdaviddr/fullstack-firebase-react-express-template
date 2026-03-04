/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';

// mock firebase before any app module is loaded
vi.mock('../../src/firebase', () => ({ default: {} }));
vi.mock('../../src/repositories/userRepository', () => ({
  verifyIdToken: vi.fn(),
}));

import request from 'supertest';
import { createApp } from '../../src/app';
import { verifyIdToken } from '../../src/repositories/userRepository';

describe('e2e /api/me', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 when no token', async () => {
    const app = createApp();
    await request(app).get('/api/me').expect(401);
  });

  it('returns 401 when token invalid', async () => {
    vi.mocked(verifyIdToken).mockRejectedValue(new Error('invalid'));
    const app = createApp();
    await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer bad')
      .expect(401);
  });

  it('returns 200 and user profile when token valid', async () => {
    const decoded = { uid: 'user123', email: 'a@b.com', name: 'Alice', picture: null } as any;
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);

    const app = createApp();
    const res = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer good');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ uid: 'user123', email: 'a@b.com' });
  });
});
