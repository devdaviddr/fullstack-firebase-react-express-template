/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';

// mock firebase before any app module is loaded
vi.mock('../../src/firebase', () => ({ default: {} }));
vi.mock('../../src/repositories/userRepository', () => ({
  verifyIdToken: vi.fn(),
  deleteUser: vi.fn(),
}));

import request from 'supertest';
import { createApp } from '../../src/app';
import { verifyIdToken, deleteUser } from '../../src/repositories/userRepository';

const decoded: any = { uid: 'user123', email: 'a@b.com', name: 'Alice', picture: null };

describe('e2e /api/me', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ── GET /api/me ────────────────────────────────────────────────────────────
  it('GET returns 401 when no token', async () => {
    const app = createApp();
    await request(app).get('/api/me').expect(401);
  });

  it('GET returns 401 when token invalid', async () => {
    vi.mocked(verifyIdToken).mockRejectedValue(new Error('invalid'));
    const app = createApp();
    await request(app).get('/api/me').set('Authorization', 'Bearer bad').expect(401);
  });

  it('GET returns 200 and user profile when token valid', async () => {
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);
    const app = createApp();
    const res = await request(app).get('/api/me').set('Authorization', 'Bearer good');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ uid: 'user123', email: 'a@b.com' });
  });

  // ── PUT /api/me ─────────────────────────────────────────────────────────────
  it('PUT returns 401 without token', async () => {
    const app = createApp();
    await request(app).put('/api/me').send({ name: 'Bob' }).expect(401);
  });

  it('PUT returns 400 on invalid body', async () => {
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);
    const app = createApp();
    const res = await request(app)
      .put('/api/me')
      .set('Authorization', 'Bearer good')
      .send({ picture: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('PUT returns updated profile on valid body', async () => {
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);
    const app = createApp();
    const res = await request(app)
      .put('/api/me')
      .set('Authorization', 'Bearer good')
      .send({ name: 'Bob' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ uid: 'user123', name: 'Bob' });
  });

  // ── DELETE /api/me ───────────────────────────────────────────────────────────
  it('DELETE returns 401 without token', async () => {
    const app = createApp();
    await request(app).delete('/api/me').expect(401);
  });

  it('DELETE returns 204 with valid token', async () => {
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);
    vi.mocked(deleteUser).mockResolvedValue();
    const app = createApp();
    await request(app).delete('/api/me').set('Authorization', 'Bearer good').expect(204);
    expect(deleteUser).toHaveBeenCalledWith(decoded.uid);
  });
});
