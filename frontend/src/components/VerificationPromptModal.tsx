"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, X, ArrowRight, Lock } from "lucide-react";

interface VerificationPromptModalProps {
  onSkip: () => void;
}

export function VerificationPromptModal({ onSkip }: VerificationPromptModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 airbnb-shadow text-center space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onSkip}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto h-16 w-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#FF385C]">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-neutral-900">Get verified to unlock your passport</h2>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            Securely connect your bank account with Plaid so landlords can instantly trust your verified income,
            balances, and rental history.
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3.5 flex items-center gap-2.5 text-xs text-neutral-500 text-left">
          <Lock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          256-bit encrypted, read-only connection. MiddleMan never sees your bank credentials.
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => router.push("/verify")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Verify with Plaid
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
