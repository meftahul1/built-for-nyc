"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, User, Building2, AlertCircle, MailCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVerification } from "@/context/VerificationContext";
import { VerificationPromptModal } from "@/components/VerificationPromptModal";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { refreshStatus } = useVerification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"tenant" | "landlord">("tenant");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Compute simple password strength for visual UI feedback
  const getPasswordStrength = () => {
    if (!password) return { label: "", score: 0, color: "bg-neutral-200" };
    if (password.length < 6) return { label: "Weak", score: 1, color: "bg-rose-500" };
    if (password.length < 10) return { label: "Good", score: 2, color: "bg-amber-500" };
    return { label: "Strong", score: 3, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const { error, needsEmailConfirmation: mustConfirm } = await signUp(email, password, role);

    if (error) {
      setErrorMessage(error);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
    setNeedsEmailConfirmation(mustConfirm);

    if (mustConfirm) return;

    if (role === "landlord") {
      setTimeout(() => router.push("/dashboard"), 1200);
      return;
    }

    const status = await refreshStatus();
    if (status === "verified") {
      router.push("/tenant-dashboard");
    } else {
      setShowVerificationPrompt(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-50 px-4 py-12 font-sans sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 airbnb-shadow relative overflow-hidden">
          {/* Top Brand Header */}
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF385C] to-[#E00B41] text-white shadow-md shadow-[#FF385C]/20 transition-transform hover:scale-105">
              <ShieldCheck className="h-7 w-7 stroke-[2.2]" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                Create your account
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Join MiddleMan to verify or manage rental documents
              </p>
            </div>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center text-center gap-4 py-6 animate-in fade-in zoom-in-95">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${needsEmailConfirmation ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                {needsEmailConfirmation ? <MailCheck className="h-10 w-10" /> : <CheckCircle2 className="h-10 w-10" />}
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                {needsEmailConfirmation ? "Confirm your email" : "Account Created!"}
              </h3>
              <p className="text-xs text-neutral-500">
                {needsEmailConfirmation
                  ? `We sent a confirmation link to ${email}. Verify your email, then log in to continue.`
                  : "Welcome to MiddleMan. Your verification passport is ready."}
              </p>
              {needsEmailConfirmation && (
                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
                >
                  Go to Log In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Role Toggle Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  I am joining as a
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setRole("tenant")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      role === "tenant"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 text-[#FF385C]" />
                    Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("landlord")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      role === "landlord"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5 text-[#FF385C]" />
                    Landlord
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="block w-full rounded-2xl border border-neutral-300 bg-neutral-50/50 pl-10 pr-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-400 font-medium transition-all focus:border-[#FF385C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full rounded-2xl border border-neutral-300 bg-neutral-50/50 pl-10 pr-11 py-3.5 text-sm text-neutral-900 placeholder-neutral-400 font-medium transition-all focus:border-[#FF385C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                      <span>Password strength:</span>
                      <span className="capitalize">{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                      <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                      <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-4 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:shadow-[#FF385C]/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#FF385C] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {showVerificationPrompt && (
        <VerificationPromptModal
          onSkip={() => {
            setShowVerificationPrompt(false);
            router.push("/properties");
          }}
        />
      )}
    </div>
  );
}
