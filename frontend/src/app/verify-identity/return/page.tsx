"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useIdentity } from "@/context/IdentityContext";
import { useProperties } from "@/context/PropertyContext";
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";

type Stage = "checking" | "verified" | "processing" | "failed" | "error";

export default function VerifyIdentityReturnPage() {
  const router = useRouter();
  const { accessToken, loading: authLoading } = useAuth();
  const { refreshStatus } = useIdentity();
  const { syncOwnProfile } = useProperties();

  const [stage, setStage] = useState<Stage>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const check = useCallback(() => {
    refreshStatus()
      .then((result) => {
        syncOwnProfile({ identity: result });
        if (result.status === "verified") {
          setStage("verified");
          setTimeout(() => router.push("/tenant-dashboard"), 1200);
        } else if (result.status === "processing") {
          setStage("processing");
        } else {
          setStage("failed");
        }
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : "Could not check verification status.");
        setStage("error");
      });
  }, [refreshStatus, syncOwnProfile, router]);

  const retry = useCallback(() => {
    setStage("checking");
    check();
  }, [check]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, accessToken]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 airbnb-shadow text-center space-y-5">
        {stage === "error" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-[#FF385C]">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Couldn&apos;t check status</h1>
            <p className="text-sm text-neutral-500">{errorMessage}</p>
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </>
        ) : stage === "failed" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Verification not completed</h1>
            <p className="text-sm text-neutral-500">
              The Stripe Identity session ended before your document was confirmed. Head back to your dashboard to
              try again.
            </p>
            <button
              onClick={() => router.push("/tenant-dashboard")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Back to dashboard
            </button>
          </>
        ) : stage === "processing" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Stripe is reviewing your ID</h1>
            <p className="text-sm text-neutral-500">
              This usually takes less than a minute. You can check again from your dashboard.
            </p>
            <button
              onClick={() => router.push("/tenant-dashboard")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 text-sm font-bold text-white hover:bg-neutral-800 transition-colors"
            >
              Go to dashboard
            </button>
          </>
        ) : stage === "verified" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Identity verified!</h1>
            <p className="text-sm text-neutral-500">Redirecting to your dashboard…</p>
          </>
        ) : (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Checking your verification…</h1>
            <p className="text-sm text-neutral-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              One moment
            </p>
          </>
        )}
      </div>
    </div>
  );
}
