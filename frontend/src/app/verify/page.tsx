"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlaidLink, PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { useAuth } from "@/context/AuthContext";
import { useVerification } from "@/context/VerificationContext";
import { useProperties } from "@/context/PropertyContext";
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

type Stage = "loading" | "ready" | "linking" | "verifying" | "done" | "exited" | "error";

export default function VerifyPage() {
  const router = useRouter();
  const { accessToken, loading: authLoading } = useAuth();
  const { getLinkToken, completeLink } = useVerification();
  const { syncOwnProfile } = useProperties();

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const hasAutoOpened = useRef(false);

  // Triggers a (re)fetch of a fresh link token. Only ever called from an
  // event handler (mount effect below only bumps `attempt`, it never calls
  // this directly) so the resulting setState calls never happen
  // synchronously inside an effect body.
  const requestLinkToken = useCallback(() => {
    hasAutoOpened.current = false;
    getLinkToken()
      .then((token) => {
        setLinkToken(token);
        setStage("ready");
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : "Could not start Plaid Link.");
        setStage("error");
      });
  }, [getLinkToken]);

  const retry = useCallback(() => {
    setStage("loading");
    setErrorMessage(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    requestLinkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, accessToken, attempt]);

  const onSuccess = useCallback(
    async (publicToken: string | null, metadata: PlaidLinkOnSuccessMetadata) => {
      if (!publicToken) return;
      setStage("verifying");
      try {
        const result = await completeLink(
          publicToken,
          metadata.institution?.institution_id ?? null,
          metadata.institution?.name ?? null
        );
        syncOwnProfile(result);
        setStage("done");
        setTimeout(() => router.push("/tenant-dashboard"), 1200);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Verification failed.");
        setStage("error");
      }
    },
    [completeLink, router, syncOwnProfile]
  );

  const onExit = useCallback(() => {
    setStage((prev) => (prev === "verifying" || prev === "done" ? prev : "exited"));
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  useEffect(() => {
    if (stage === "ready" && ready && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      setStage("linking");
      open();
    }
  }, [stage, ready, open]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 airbnb-shadow text-center space-y-5">
        {stage === "error" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-[#FF385C]">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Verification failed</h1>
            <p className="text-sm text-neutral-500">{errorMessage}</p>
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </>
        ) : stage === "exited" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Verification cancelled</h1>
            <p className="text-sm text-neutral-500">
              You closed the Plaid window before finishing. You can pick up where you left off any time.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={retry}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Resume Verification
              </button>
              <Link href="/properties" className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 py-2">
                Continue browsing without verifying
              </Link>
            </div>
          </>
        ) : stage === "done" ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">You&apos;re verified!</h1>
            <p className="text-sm text-neutral-500">Redirecting to your passport…</p>
          </>
        ) : (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900">Connecting to Plaid…</h1>
            <p className="text-sm text-neutral-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {stage === "verifying" ? "Verifying your income and balances…" : "Preparing your secure bank connection…"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
