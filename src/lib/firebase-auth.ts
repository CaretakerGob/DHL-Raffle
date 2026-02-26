import { Auth, getAuth, signInAnonymously } from 'firebase/auth';
import { app, isFirebaseConfigured } from '@/lib/firebase';

let authInstance: Auth | null = null;

if (app && isFirebaseConfigured) {
  authInstance = getAuth(app);
}

export const auth = authInstance;

export const ensureFirebaseAuth = async (): Promise<boolean> => {
  if (!auth) return false;
  if (auth.currentUser) return true;

  try {
    await signInAnonymously(auth);
    return true;
  } catch {
    return false;
  }
};
