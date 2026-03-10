import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { setUnauthenticatedHandler } from '../../api/axios';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Returns the current user's Firebase ID token for use as a Bearer token. */
  getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    // clear any cached server data when user signs out
    queryClient.clear();
  }, [queryClient]);

  // Register the axios interceptor so any 401 response automatically signs the user out.
  // Re-registers whenever signOut identity changes (i.e. when queryClient changes).
  useEffect(() => {
    setUnauthenticatedHandler(() => {
      signOut().catch(console.error);
    });
  }, [signOut]);

  const getIdToken = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
