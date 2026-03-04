// global test utilities and matchers
import '@testing-library/jest-dom';

// vi.mock is hoisted above imports by Vitest, so this stub is in place
// before any module that imports firebase (e.g. AuthContext) is evaluated.
vi.mock('./firebase', () => ({
  auth: {},
  googleProvider: {},
}));
