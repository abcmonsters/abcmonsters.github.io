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
export type SavedHero = 'mon' | 'mori' | 'rio' | 'sol';

export const normalizeHero = (value: unknown): SavedHero =>
  value === 'mori' || value === 'rio' || value === 'sol' ? value : 'mon';

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

export const normalizeProgress = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  const completed = new Set(
      value.filter((item) => Number.isInteger(item) && item >= 0 && item < 26),
    ),
    sequence: number[] = [];
  for (let level = 0; level < 26 && completed.has(level); level++)
    sequence.push(level);
  return sequence;
};

export const normalizeRatings = (value: unknown) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, rating]) => {
      const level = Number(key),
        stars = Number(rating);
      return Number.isInteger(level) &&
        level >= 0 &&
        level < 26 &&
        Number.isInteger(stars) &&
        stars >= 1 &&
        stars <= 3
        ? [[String(level), stars]]
        : [];
    }),
  ) as Record<string, number>;
};

export async function loadCloudProgress(uid: string) {
  if (!database) return [];
  const snapshot = await getDoc(doc(database, 'players', uid));
  return normalizeProgress(snapshot.data()?.completed);
}

export async function loadCloudHero(uid: string) {
  if (!database) return null;
  const snapshot = await getDoc(doc(database, 'players', uid));
  const hero = snapshot.data()?.hero;
  return hero === 'mon' || hero === 'mori' || hero === 'rio' || hero === 'sol'
    ? hero
    : null;
}

export async function loadCloudRatings(uid: string) {
  if (!database) return {};
  const snapshot = await getDoc(doc(database, 'players', uid));
  return normalizeRatings(snapshot.data()?.ratings);
}

export async function saveCloudProgress(
  uid: string,
  completed: number[],
  ratings?: Record<string, number>,
  hero?: SavedHero,
) {
  if (!database) return;
  const payload: Record<string, unknown> = {
    completed: normalizeProgress(completed),
    updatedAt: serverTimestamp(),
  };
  if (ratings) payload.ratings = normalizeRatings(ratings);
  if (hero) payload.hero = normalizeHero(hero);
  await setDoc(doc(database, 'players', uid), payload, { merge: true });
}
