import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app, isFirebaseConfigured } from '@/lib/firebase';

let authInstance: Auth | null = null;

if (app && isFirebaseConfigured) {
  authInstance = getAuth(app);
}

export const auth = authInstance;

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }

  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }

  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  return credentials.user;
};

export const signOutFromFirebase = async (): Promise<void> => {
  if (!auth) {
    return;
  }

  await signOut(auth);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured.');
  }

  await sendPasswordResetEmail(auth, email);
};

export const subscribeToAuthState = (
  callback: (user: User | null) => void
): (() => void) => {
  if (!auth || !isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

export const ensureFirebaseAuth = async (): Promise<boolean> => {
  if (!auth) return false;
  if (auth.currentUser) return true;

  return false;
};
