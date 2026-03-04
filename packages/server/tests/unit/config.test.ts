/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config parsing', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults are applied when env vars missing', async () => {
    // Do not stub PORT — leaving it absent lets the default 3001 apply
    vi.stubEnv('CORS_ORIGIN', 'http://localhost:5173');
    const { config } = await import('../../src/config');
    expect(config.port).toBe(3001);
    expect(config.corsOrigin).toBe('http://localhost:5173');
    expect(config.rateLimit.windowMs).toBe(15 * 60 * 1000);
    expect(config.rateLimit.max).toBe(100);
  });

  it('parses provided PORT and CORS_ORIGIN', async () => {
    vi.stubEnv('PORT', '4000');
    vi.stubEnv('CORS_ORIGIN', 'https://example.com');
    const { config } = await import('../../src/config');
    expect(config.port).toBe(4000);
    expect(config.corsOrigin).toBe('https://example.com');
  });

  it('config exports expected shape', async () => {
    const { config } = await import('../../src/config');
    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('corsOrigin');
    expect(config.rateLimit).toHaveProperty('windowMs');
    expect(config.rateLimit).toHaveProperty('max');
    expect(config.firebase).toHaveProperty('projectId');
  });
});
