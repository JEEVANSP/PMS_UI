import { useEffect } from "react";
import { useAppSelector } from "@app/store";
import { useNavigate } from "react-router-dom";

import { useLoginFlow } from "@auth/hooks/useLoginFlow";
import { getDashboardRoute } from "@auth/utils/getDashboardRoute";
import LoginForm from "./LoginForm";
import appLogo from "@assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { status, user } = useAppSelector((s) => s.auth);
  const { login, errorMessage, clearError } = useLoginFlow();

  const isLoading = status === "loading";

  // Handle navigation after successful login
  useEffect(() => {
    if (user) {
      navigate(getDashboardRoute(user.role));
    }
  }, [user, navigate]);

  const handleSubmit = async (username: string, password: string) => {
    await login(username, password);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.25)]">
          {/* Logo */}
          <div className="text-center mb-6">
            <img
              src={appLogo}
              alt="MediFlow logo"
              className="mx-auto h-24 w-24 rounded-3xl object-contain shadow-[0_18px_45px_-18px_rgba(20,184,166,0.7)]"
            />
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
              MediFlow
            </h1>
            <p className="mt-1 text-sm text-slate-500">Pharmacy Management System</p>
          </div>

          {/* Form */}
          <LoginForm
            isLoading={isLoading}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onErrorClear={clearError}
          />
        </div>
      </div>
    </div>
  );
}
