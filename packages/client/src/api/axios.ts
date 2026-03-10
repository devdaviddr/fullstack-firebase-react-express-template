import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a callback to be invoked whenever the server returns 401.
 * Call this from AuthContext so the user is signed out on an expired/revoked session.
 */
let _onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(handler: () => void): void {
  _onUnauthenticated = handler;
}

instance.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
    if (status === 401 && _onUnauthenticated) {
      _onUnauthenticated();
    }
    return Promise.reject(error);
  },
);

export default instance;
