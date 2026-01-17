import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  loginAnon: () => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      loginAnon: async () => {
        await signInAnonymously(auth);
      },
      loginGoogle: async () => {
        await signInWithPopup(auth, googleProvider);
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
