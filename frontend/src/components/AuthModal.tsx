"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "./BrandLogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    role,
    setRole,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    lastUsedEmail,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill email with previously used email when opening modal or changing tabs
  useEffect(() => {
    if (isOpen) {
      setEmail(lastUsedEmail || localStorage.getItem("journeybuddy_last_email") || "");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setAdminPasscode("");
      setError(null);
    }
  }, [isOpen, lastUsedEmail]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: "traveler" | "admin") => {
    setRole(newRole);
    setIsSignUp(false);
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setAdminPasscode("");
    // Ensure the remembered email remains loaded
    setEmail(lastUsedEmail || localStorage.getItem("journeybuddy_last_email") || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === "admin") {
        // Admin Validation
        if (adminPasscode !== "ADMIN_SECRET_2026") {
          throw new Error("Invalid Admin Security Passcode.");
        }
        await loginWithEmail(email.trim(), password);
      } else {
        // Traveler Flow
        if (isSignUp) {
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
          }
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters.");
          }
          await signupWithEmail(email.trim(), password);
        } else {
          await loginWithEmail(email.trim(), password);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0A1815] border border-stone-200 dark:border-emerald-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 font-sans">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 dark:bg-black/40 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {role === "admin"
              ? "Administrator Portal Access"
              : isSignUp
              ? "Create your traveler account"
              : "Sign in to your travel companion"}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex rounded-xl bg-stone-100 dark:bg-black/40 p-1 mb-6 border border-stone-200 dark:border-emerald-900/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleChange("traveler")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              role === "traveler"
                ? "bg-white dark:bg-[#0B6E4F] text-stone-900 dark:text-white shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            ✈️ Traveler
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              role === "admin"
                ? "bg-white dark:bg-[#0B6E4F] text-stone-900 dark:text-white shadow-xs"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-mono text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Traveler Full Name (Sign Up only) */}
          {role === "traveler" && isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/40 border border-stone-300 dark:border-emerald-900/60 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#FF9209]"
              />
            </div>
          )}

          {/* Email Address (Always pre-filled with last used email) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                Email Address
              </label>
              {lastUsedEmail && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Saved Account
                </span>
              )}
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@journeybuddy.com"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/40 border border-stone-300 dark:border-emerald-900/60 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#FF9209]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/40 border border-stone-300 dark:border-emerald-900/60 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#FF9209]"
            />
          </div>

          {/* Confirm Password (Traveler Sign Up only) */}
          {role === "traveler" && isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/40 border border-stone-300 dark:border-emerald-900/60 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-[#FF9209]"
              />
            </div>
          )}

          {/* Admin Passcode (Admin tab only) */}
          {role === "admin" && (
            <div>
              <label className="block text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                Admin Security Passcode
              </label>
              <input
                type="password"
                required
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                placeholder="Enter secret passcode"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/40 border border-amber-300 dark:border-amber-700/60 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#FF9209] to-[#8B5CF6] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span> Processing...
              </span>
            ) : role === "admin" ? (
              "Access Admin Dashboard →"
            ) : isSignUp ? (
              "Create Account →"
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        {/* Google Quick Sign-in (Traveler only) */}
        {role === "traveler" && (
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-emerald-900/30">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-black/40 hover:bg-stone-200 dark:hover:bg-black/60 border border-stone-300 dark:border-emerald-900/60 text-xs font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>🌐</span> Continue with Google
            </button>

            {/* Toggle Sign In / Sign Up */}
            <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-[#FF9209] hover:underline font-bold cursor-pointer"
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