"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  role: "traveler" | "admin";
  loading: boolean;
  lastUsedEmail: string;
  setRole: (role: "traveler" | "admin") => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"traveler" | "admin">("traveler");
  const [loading, setLoading] = useState(true);
  const [lastUsedEmail, setLastUsedEmail] = useState<string>("");

  useEffect(() => {
    // 1. Load the previously used email from localStorage
    const savedEmail = localStorage.getItem("journeybuddy_last_email") || "";
    setLastUsedEmail(savedEmail);

    // 2. Set session persistence and immediately log out on page refresh
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
        // Force sign out on refresh
        await signOut(auth);
        setUser(null);
      } catch (err) {
        console.error("Auth session reset error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        setLastUsedEmail(currentUser.email);
        localStorage.setItem("journeybuddy_last_email", currentUser.email);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveEmailToStorage = (email: string) => {
    if (email) {
      setLastUsedEmail(email);
      localStorage.setItem("journeybuddy_last_email", email);
    }
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user?.email) {
      saveEmailToStorage(res.user.email);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    saveEmailToStorage(email);
  };

  const signupWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
    saveEmailToStorage(email);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        lastUsedEmail,
        setRole,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};