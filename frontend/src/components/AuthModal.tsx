"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { role, setRole, loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [fullName, setFullName] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Helper to clear all input fields
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPass("");
    setFullName("");
    setAdminPasscode("");
    setError("");
  };

  // Reset fields whenever the modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      clearForm();
      setIsSignUp(false);
    }
  }, [isOpen]);

  // Handle switching between Sign In and Sign Up cleanly
  const toggleAuthMode = (signUpMode: boolean) => {
    clearForm();
    setIsSignUp(signUpMode);
  };

  // Handle switching roles cleanly
  const handleRoleChange = (newRole: "traveler" | "admin") => {
    clearForm();
    setRole(newRole);
    if (newRole === "admin") {
      setIsSignUp(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (role === "admin") {
        if (adminPasscode !== "ADMIN_SECRET_2026") {
          throw new Error("Invalid admin security passcode.");
        }
        await loginWithEmail(email, password);
      } else {
        if (isSignUp) {
          if (password !== confirmPass) {
            throw new Error("Passwords do not match.");
          }
          await signupWithEmail(email, password);
        } else {
          await loginWithEmail(email, password);
        }
      }
      clearForm();
      onClose();
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      await loginWithGoogle();
      clearForm();
      onClose();
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            clearForm();
            onClose();
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {role === "admin"
            ? "Admin Portal Access"
            : isSignUp
            ? "Create Traveler Account"
            : "Sign In to JourneyBuddy"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {role === "admin"
            ? "Enter your credentials and authorization code."
            : isSignUp
            ? "Plan itineraries and track trip updates."
            : "Sign in to view itineraries and saved routes."}
        </p>

        {/* Role Switcher */}
        <div className="mt-4 flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => handleRoleChange("traveler")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              role === "traveler"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            🧳 Traveler
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              role === "admin"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/40 p-2.5 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Form with auto-fill safety */}
        <form onSubmit={handleSubmit} autoComplete="off" className="mt-4 space-y-3">
          {role === "traveler" && isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "admin" ? "admin@journeybuddy.internal" : "alex@example.com"}
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {role === "traveler" && isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {role === "admin" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Admin Passcode
              </label>
              <input
                type="password"
                required
                autoComplete="off"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder="Secret access passcode"
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold text-white shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {submitting
              ? "Authenticating..."
              : role === "admin"
              ? "Access Admin Dashboard"
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Google OAuth Option (Traveler Only) */}
        {role === "traveler" && (
          <div className="mt-4">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              <span className="flex-shrink mx-2 text-[10px] uppercase text-slate-400">or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Toggle Sign Up vs Sign In */}
            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => toggleAuthMode(!isSignUp)}
                className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}