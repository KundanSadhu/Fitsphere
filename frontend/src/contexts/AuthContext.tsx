import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  getRedirectResult,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface UserData {
  id: string;
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: 'client' | 'trainer' | 'admin';
  provider: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createOrUpdateUserDoc = async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, { lastLogin: new Date().toISOString() });
      setUserData(userSnap.data() as UserData);
    } else {
      const newUser: UserData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || '',
        role: 'client',
        provider: 'google.com',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(userRef, newUser);
      setUserData(newUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await createOrUpdateUserDoc(firebaseUser);
        } catch (err) {
          console.error('Error creating/updating user doc:', err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        createOrUpdateUserDoc(result.user);
      }
    }).catch((err) => {
      console.error('Redirect result error:', err);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUserDoc(result.user);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const isAdmin = userData?.role === 'admin' || userData?.role === 'trainer';

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
