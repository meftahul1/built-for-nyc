"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createIdentitySession, getIdentityStatus, IdentityStatusResponse } from "@/lib/api";

export type IdentityStatus = "unknown" | "unverified" | "requires_input" | "processing" | "verified" | "failed";

function deriveStatus(result: IdentityStatusResponse | null): IdentityStatus {
  if (!result || result.status === "not_started") return "unverified";
  if (result.status === "verified") return "verified";
  if (result.status === "canceled") return "failed";
  // "requires_input" means Stripe is waiting on the user (never started, or a
  // prior attempt needs to be redone) — actionable, unlike true "processing"
  // where Stripe is actively reviewing an already-submitted document.
  if (result.status === "requires_input") return "requires_input";
  return "processing";
}

export interface IdentityResult {
  status: IdentityStatus;
  data: IdentityStatusResponse | null;
}

interface IdentityContextType {
  status: IdentityStatus;
  data: IdentityStatusResponse | null;
  refreshStatus: () => Promise<IdentityResult>;
  startVerification: (returnUrl: string) => Promise<string>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<IdentityStatus>("unknown");
  const [data, setData] = useState<IdentityStatusResponse | null>(null);

  const refreshStatus = useCallback(async (): Promise<IdentityResult> => {
    if (!accessToken) {
      setStatus("unknown");
      return { status: "unknown", data: null };
    }
    try {
      const result = await getIdentityStatus(accessToken);
      setData(result);
      const next = deriveStatus(result);
      setStatus(next);
      return { status: next, data: result };
    } catch {
      setStatus("unverified");
      return { status: "unverified", data: null };
    }
  }, [accessToken]);

  const startVerification = useCallback(
    async (returnUrl: string) => {
      if (!accessToken) throw new Error("You must be logged in to verify your identity.");
      const res = await createIdentitySession(accessToken, returnUrl);
      return res.url;
    },
    [accessToken]
  );

  return (
    <IdentityContext.Provider value={{ status, data, refreshStatus, startVerification }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within an IdentityProvider");
  return ctx;
};
