import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import clsx from "clsx";

const inputClass = (extraClasses?: string) =>
  clsx(
    // Layout & base
    "w-full bg-white/80 border border-gray-200 rounded-xl",
    "px-4 py-3 pl-12 text-gray-800 placeholder:text-gray-400",
    // Depth
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
    // Transitions
    "transition-all duration-200",
    // Hover
    "hover:border-gray-300 hover:bg-white",
    // Focus — remove default outline/ring, add premium glow
    "focus:outline-none focus:ring-0",
    "focus:border-blue-500",
    "focus:shadow-[0_0_0_4px_rgba(59,130,246,0.18),0_10px_30px_-12px_rgba(20,184,166,0.35)]",
    // Disabled
    "disabled:opacity-60 disabled:cursor-not-allowed",
    extraClasses
  );

type Props = {
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (username: string, password: string) => void;
  onErrorClear: () => void;
};

export default function LoginForm({
  isLoading,
  errorMessage,
  onSubmit,
  onErrorClear,
}: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errorMessage) onErrorClear();
            }}
            className={inputClass()}
            placeholder="Enter your email"
            required
            disabled={isLoading}
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) onErrorClear();
            }}
            className={inputClass("pr-14")}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Inline Error */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3"
        >
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={clsx(
          "w-full rounded-xl py-3.5 font-medium text-white",
          "bg-gradient-to-r from-blue-600 to-teal-500",
          "shadow-[0_16px_45px_-18px_rgba(59,130,246,0.9)]",
          "hover:from-blue-700 hover:to-teal-600",
          "hover:shadow-[0_20px_55px_-20px_rgba(20,184,166,0.95)]",
          "active:scale-[0.99]",
          "transition-all duration-200",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-xs text-slate-500">
        Secure login • Powered by MediFlow
      </p>
    </form>
  );
}

