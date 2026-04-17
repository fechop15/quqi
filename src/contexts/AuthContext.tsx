'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, Role } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            nombre: data.nombre || firebaseUser.displayName || '',
            role: data.role as Role,
            activo: data.activo ?? true,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          });
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('Usuario no encontrado en la base de datos');
    }
    const data = userDoc.data();
    if (!data.activo) {
      await signOut(auth);
      throw new Error('Usuario desactivado. Contacte al administrador.');
    }
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: nombre });
      
      const userData = {
        email,
        nombre,
        role: 'vendedor',
        activo: true,
        createdAt: serverTimestamp(),
      };
      
      console.log('Creando documento en Firestore:', user.uid, userData);
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('Documento creado exitosamente');
    } catch (error) {
      console.error('Error en signUp:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const hasRole = (roles: Role[]) => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
