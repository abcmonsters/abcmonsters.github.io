import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const config = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    'AIzaSyD1L7fN_stVheXDVW9gjnRLfNaF7feL3fM',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    'abc-monsters-progress.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'abc-monsters-progress',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    'abc-monsters-progress.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '230579587667',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    '1:230579587667:web:99f3a8e1d7a134dd0a54a6',
};

export const cloudProgressEnabled = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId,
);

const app = cloudProgressEnabled
    ? getApps().length
      ? getApp()
      : initializeApp(config)
    : null,
  auth = app ? getAuth(app) : null,
  database = app ? getFirestore(app) : null;

export type ProgressUser = Pick<
  User,
  'uid' | 'displayName' | 'email' | 'photoURL'
>;

export function watchProgressUser(
  callback: (user: ProgressUser | null) => void,
) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  void setPersistence(auth, browserLocalPersistence);
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Google sign-in is not configured');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return (await signInWithPopup(auth, provider)).user;
}

export async function signOutProgressUser() {
  if (auth) await signOut(auth);
}

const cleanProgress = (value: unknown) =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (item) => Number.isInteger(item) && item >= 0 && item < 26,
          ),
        ),
      ].sort((a, b) => a - b)
    : [];

export async function loadCloudProgress(uid: string) {
  if (!database) return [];
  const snapshot = await getDoc(doc(database, 'players', uid));
  return cleanProgress(snapshot.data()?.completed);
}

export async function saveCloudProgress(uid: string, completed: number[]) {
  if (!database) return;
  await setDoc(
    doc(database, 'players', uid),
    { completed: cleanProgress(completed), updatedAt: serverTimestamp() },
    { merge: true },
  );
}
