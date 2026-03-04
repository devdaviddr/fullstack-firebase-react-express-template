# Firebase Authentication

This document covers how authentication is implemented across the client and server, from the initial Google Sign-In to verifying ID tokens on protected API routes.

---

## Overview

The app uses **Firebase Authentication with Google Sign-In**. Firebase handles credential management and issues signed JWTs (called *ID tokens*). The server never sees the user's password or OAuth tokens — it only ever sees and validates those JWTs.

```
User → Google OAuth → Firebase Auth → ID token → Express server
```

---

## Client-Side Auth

### Initialisation (`src/firebase.ts`)

The Firebase client SDK is initialised once with the project config read from `VITE_*` environment variables:

```ts
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

`auth` is the central auth instance used everywhere in the client. `googleProvider` configures Google as the identity provider.

---

### Auth Context (`src/features/auth/AuthContext.tsx`)

`AuthProvider` wraps the entire app and exposes a React context with five values:

| Value | Type | Description |
|---|---|---|
| `user` | `User \| null` | The currently signed-in Firebase user, or `null` |
| `loading` | `boolean` | `true` until Firebase resolves the initial auth state |
| `signInWithGoogle` | `() => Promise<void>` | Opens the Google Sign-In popup |
| `signOut` | `() => Promise<void>` | Signs the user out |
| `getIdToken` | `() => Promise<string>` | Returns a fresh ID token for the current user |

#### Listening to auth state

```ts
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
    setLoading(false);
  });
  return unsubscribe;
}, []);
```

`onAuthStateChanged` fires immediately with the persisted auth state (from `localStorage`) and again whenever the user signs in or out. Setting `loading = false` only after this first callback prevents routes from flashing the login page before Firebase has had a chance to restore the session.

#### Google Sign-In

```ts
const signInWithGoogle = async () => {
  await signInWithPopup(auth, googleProvider);
};
```

`signInWithPopup` opens a Google OAuth popup. On success, Firebase automatically:
- Stores the session in `localStorage` (persists across page reloads)
- Updates the `onAuthStateChanged` listener with the new `User` object

#### Getting an ID token

```ts
const getIdToken = async (): Promise<string> => {
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
};
```

`user.getIdToken()` returns the cached ID token if it's still valid, or transparently fetches a fresh one from Firebase if it's about to expire. Tokens have a **1-hour TTL**.

---

### Route Guard (`src/components/ProtectedRoute.tsx`)

```ts
if (loading) return <LoadingSpinner />;
return user ? <>{children}</> : <Navigate to="/login" replace />;
```

Two behaviours:
- **Loading** — waits for `onAuthStateChanged` to fire before making a decision; prevents an incorrect redirect to `/login` on page load.
- **Not authenticated** — redirects to `/login`.
- **Authenticated** — renders the wrapped page.

---

### Login Page (`src/pages/Login.tsx`)

Calls `signInWithGoogle()` on button click. A `useEffect` watches the `user` value and redirects to `/` as soon as the sign-in completes:

```ts
useEffect(() => {
  if (user) navigate('/', { replace: true });
}, [user, navigate]);
```

---

### Calling a Protected Endpoint (`src/pages/Dashboard.tsx`)

```ts
const token = await getIdToken();
const res = await fetch('/api/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

The ID token is sent as a standard `Authorization: Bearer` header. The Vite proxy forwards the request — including all headers — to the Express server.

---

## Server-Side Auth

### Firebase Admin Initialisation (`packages/server/src/firebase.ts`)

The Admin SDK is initialised with service account credentials, which give the server the ability to verify tokens issued for your Firebase project.

The server supports two credential formats, checked in order:

1. **`FIREBASE_SERVICE_ACCOUNT_JSON`** — a full service account JSON string (useful when the secret store provides a single JSON blob).
2. **Individual variables** — `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (easier for most `.env` setups).

```ts
if (serviceAccountJson) {
  const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
```

> **Note on `FIREBASE_PRIVATE_KEY`:** RSA private keys contain literal newline characters. When stored as a `\n`-escaped string (e.g. in some secret managers), the `.replace(/\\n/g, '\n')` call converts them back. When stored in a `.env` file with real line breaks inside a double-quoted value, dotenv preserves them and no replacement is needed.

---

### Auth Middleware (`packages/server/src/middleware/authMiddleware.ts`)

Applied to every protected route. Steps:

1. **Extract the token** — reads the `Authorization` header and strips the `Bearer ` prefix. Returns `401` immediately if the header is missing or malformed.

```ts
const authHeader = req.headers.authorization;
if (!authHeader?.startsWith('Bearer ')) {
  res.status(401).json({ error: 'Missing or invalid Authorization header' });
  return;
}
const idToken = authHeader.split('Bearer ')[1];
```

2. **Verify the token** — calls Firebase Admin to validate the JWT signature, expiry, and audience.

```ts
const decodedToken = await admin.auth().verifyIdToken(idToken);
req.user = decodedToken;
next();
```

3. **Attach the decoded payload** — the `DecodedIdToken` added to `req.user` contains `uid`, `email`, `name`, `picture`, and other standard JWT claims that route handlers can use without any additional database lookup.

4. **Reject invalid tokens** — any error (expired, tampered, wrong project) returns `401`.

---

### Protected Route Example

```ts
app.get('/api/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { uid, email, name, picture } = req.user!;
  res.json({ uid, email, name, picture });
});
```

Because `authMiddleware` calls `next()` only on success, route handlers can safely assume `req.user` is populated.

---

## Token Lifecycle

```
Sign-in
  └─▶ Firebase issues ID token (JWT, 1 hour TTL)
        └─▶ Stored in memory by the Firebase JS SDK
              └─▶ getIdToken() auto-refreshes before expiry
                    └─▶ Sent as Bearer token with every API request
                          └─▶ Server verifies with Firebase Admin
                                └─▶ Decoded payload used in handler
```

- ID tokens expire after **1 hour**.
- The client SDK handles refresh automatically — no manual token management required.
- Refresh tokens are long-lived and stored in `localStorage` by Firebase; they are used to obtain new ID tokens silently.
- Calling `signOut()` clears both the local session and prevents further token refreshes.

---

## Security Notes

- ID tokens are **verified against Google's public keys** by the Admin SDK — they cannot be forged without the corresponding private key.
- The server never stores tokens; verification is stateless.
- The private key in `FIREBASE_PRIVATE_KEY` (server `.env`) must be kept secret — it enables token verification for the entire project.
- Client-side env vars (`VITE_*`) are embedded in the browser bundle and are **not secret**. The Firebase API key is safe to expose; it only identifies the project, it does not grant admin access.
