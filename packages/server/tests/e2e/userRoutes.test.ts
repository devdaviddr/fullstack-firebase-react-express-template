import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DecodedIdToken } from 'firebase-admin/auth';

// mock firebase before any app module is loaded
vi.mock('../../src/firebase', () => ({ default: {} }));
vi.mock('../../src/repositories/userRepository', () => ({
  verifyIdToken: vi.fn(),
  deleteUser: vi.fn(),
  ensureUser: vi.fn(),
  updateUser: vi.fn(),
  getAllUsers: vi.fn().mockResolvedValue([]),
}));

import request from 'supertest';
import { createApp } from '../../src/app';
import { verifyIdToken, deleteUser, ensureUser, updateUser, getAllUsers } from '../../src/repositories/userRepository';

const decoded = { uid: 'user123', email: 'a@b.com', name: 'Alice', picture: null } as unknown as DecodedIdToken;

describe('e2e /api/me', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getAllUsers).mockResolvedValue([]);
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
    expect(ensureUser).toHaveBeenCalledWith(expect.objectContaining({ uid: 'user123' }));
  });

  // ── PUT /api/me ─────────────────────────────────────────────────────────────

  // ── GET /api/users ───────────────────────────────────────────────────────────
  it('GET /api/users returns list when auth is valid', async () => {
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);
    const app = createApp();
    const res = await request(app).get('/api/users').set('Authorization', 'Bearer good');
    expect(res.status).toBe(200);
    // since repo is mocked to return undefined by default, body will be []
    expect(res.body).toEqual([]);
  });

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
    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ uid: 'user123' }));
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
