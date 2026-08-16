"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createLinkToken,
  exchangePublicToken,
  runVerification,
  getVerificationStatus,
  VerifyStatusResponse,
} from "@/lib/api";

export type VerificationStatus = "unknown" | "unverified" | "processing" | "verified" | "failed";

function deriveStatus(result: VerifyStatusResponse | null): VerificationStatus {
  if (!result || !result.item) return "unverified";
  if (result.income?.status === "success") return "verified";
  if (result.income?.status === "failed") return "failed";
  return "processing";
}

interface VerificationContextType {
  status: VerificationStatus;
  data: VerifyStatusResponse | null;
  refreshStatus: () => Promise<VerificationStatus>;
  getLinkToken: () => Promise<string>;
  completeLink: (
    publicToken: string,
    institutionId: string | null,
    institutionName: string | null
  ) => Promise<VerificationStatus>;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>("unknown");
  const [data, setData] = useState<VerifyStatusResponse | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!accessToken) {
      setStatus("unknown");
      return "unknown" as VerificationStatus;
    }
    try {
      const result = await getVerificationStatus(accessToken);
      setData(result);
      const next = deriveStatus(result);
      setStatus(next);
      return next;
    } catch {
      setStatus("unverified");
      return "unverified" as VerificationStatus;
    }
  }, [accessToken]);

  const getLinkToken = useCallback(async () => {
    if (!accessToken) throw new Error("You must be logged in to verify.");
    const res = await createLinkToken(accessToken);
    return res.link_token;
  }, [accessToken]);

  const completeLink = useCallback(
    async (publicToken: string, institutionId: string | null, institutionName: string | null) => {
      if (!accessToken) throw new Error("You must be logged in to verify.");
      await exchangePublicToken(accessToken, {
        public_token: publicToken,
        institution_id: institutionId,
        institution_name: institutionName,
      });
      const result = await runVerification(accessToken);
      setData((prev) => ({
        item: prev?.item ?? { id: "", institution_name: institutionName, status: "linked", created_at: new Date().toISOString() },
        balances: result.balances,
        income: result.income,
      }));
      const next: VerificationStatus = result.income.status === "success" ? "verified" : "processing";
      setStatus(next);
      return next;
    },
    [accessToken]
  );

  return (
    <VerificationContext.Provider value={{ status, data, refreshStatus, getLinkToken, completeLink }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within a VerificationProvider");
  return ctx;
};
