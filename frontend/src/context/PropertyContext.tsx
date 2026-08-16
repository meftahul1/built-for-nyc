"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useVerification, VerificationResult } from "@/context/VerificationContext";
import {
  listProperties,
  createProperty as apiCreateProperty,
  updatePropertyCriteria as apiUpdatePropertyCriteria,
  deletePropertyRecord,
  PropertyRecord,
} from "@/lib/api";

export interface TenantCriteria {
  minIncomeMultiplier: number; // e.g. 3 = tenant must earn 3x the monthly rent
  minCreditScore: number;
  requireIncomeVerification: boolean;
  requireIdentityVerification: boolean;
  requireBackgroundCheck: boolean;
  petsAllowed: boolean;
  notes: string;
}

export const DEFAULT_CRITERIA: TenantCriteria = {
  minIncomeMultiplier: 3,
  minCreditScore: 650,
  requireIncomeVerification: true,
  requireIdentityVerification: true,
  requireBackgroundCheck: true,
  petsAllowed: false,
  notes: "",
};

// Property is the persisted shape returned by the backend (`properties`
// table in Supabase) — every listing here is a real row, not local state.
export type Property = PropertyRecord;

export interface BankAccount {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: "checking" | "savings" | "credit";
  mask: string;
  balance: number;
  isPrimary?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  type: "credit" | "debit";
}

export interface TenantProfile {
  id: string;
  name: string;
  email: string;
  identityStatus: "verified" | "pending" | "unverified";
  identityDetails: string;
  monthlyVerifiedIncome: number;
  annualVerifiedIncome: number;
  creditScore: number;
  creditTier: string;
  creditUtilization: number;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: string;
  propertyId: string;
  tenantId: string;
  status: ApplicationStatus;
  appliedAt: string;
}

// Seed applicant fixtures so the landlord Applicants tab has demo content.
// Real tenants get their own profile (keyed by their Supabase user id)
// created the moment they apply — see syncOwnProfile below. These seed
// applications point at whatever the first two listed properties are, so
// they stay meaningful once properties come from the database instead of
// hardcoded mock IDs.
const SEED_TENANTS: Record<string, TenantProfile> = {
  "demo-tenant-jordan": {
    id: "demo-tenant-jordan",
    name: "Jordan Vance",
    email: "jordan.vance@example.com",
    identityStatus: "verified",
    identityDetails: "CA State Passport (Verified)",
    monthlyVerifiedIncome: 11200,
    annualVerifiedIncome: 134400,
    creditScore: 780,
    creditTier: "Tier 1 Excellent",
    creditUtilization: 8,
    bankAccounts: [],
    transactions: [],
  },
  "demo-tenant-priya": {
    id: "demo-tenant-priya",
    name: "Priya Anand",
    email: "priya.anand@example.com",
    identityStatus: "verified",
    identityDetails: "NY Driver License (Verified)",
    monthlyVerifiedIncome: 9450,
    annualVerifiedIncome: 113400,
    creditScore: 765,
    creditTier: "Tier 1 Excellent",
    creditUtilization: 12,
    bankAccounts: [],
    transactions: [],
  },
  "demo-tenant-casey": {
    id: "demo-tenant-casey",
    name: "Casey Morgan",
    email: "casey.morgan@example.com",
    identityStatus: "pending",
    identityDetails: "Bank connection not yet completed",
    monthlyVerifiedIncome: 0,
    annualVerifiedIncome: 0,
    creditScore: 0,
    creditTier: "Not Available",
    creditUtilization: 0,
    bankAccounts: [],
    transactions: [],
  },
};

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Tenant";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface PropertyContextType {
  properties: Property[];
  propertiesLoading: boolean;
  propertiesError: string | null;
  refreshProperties: () => void;
  addProperty: (
    newProp: {
      title: string;
      address: string;
      city: string;
      state: string;
      price: number;
      bedrooms: number;
      bathrooms: number;
      sqft: number;
      description: string;
      imageUrl: string;
    },
    criteria: TenantCriteria
  ) => Promise<{ ok: boolean; message: string }>;
  deleteProperty: (id: string) => Promise<{ ok: boolean; message: string }>;
  updatePropertyCriteria: (id: string, criteria: TenantCriteria) => Promise<{ ok: boolean; message: string }>;
  tenants: Record<string, TenantProfile>;
  applications: Application[];
  applyToProperty: (propertyId: string) => { ok: boolean; message: string };
  hasAppliedTo: (propertyId: string) => boolean;
  approveApplication: (applicationId: string) => void;
  rejectApplication: (applicationId: string) => void;
  /** Snapshots the current tenant's Plaid verification state into the shared
   * applicant pool a landlord's checklist reads from. Call this after any
   * action that can change verification status — applying, or finishing
   * Plaid Link. Pass `override` when calling right after an awaited
   * verification call (e.g. `refreshStatus()`/`completeLink()`) so the write
   * uses that call's actual result instead of a context closure that may not
   * have re-rendered yet. */
  syncOwnProfile: (override?: VerificationResult) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, accessToken } = useAuth();
  const { status: verificationStatus, data: verificationData } = useVerification();

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [tenants, setTenants] = useState<Record<string, TenantProfile>>(SEED_TENANTS);
  const [applications, setApplications] = useState<Application[]>([]);

  // Properties are the shared, persisted marketplace — fetched once on
  // mount (and whenever refreshProperties() bumps reloadTick) regardless of
  // auth state, since the listing endpoint is public.
  useEffect(() => {
    let ignore = false;
    listProperties()
      .then((rows) => {
        if (ignore) return;
        setProperties(rows);
        setPropertiesError(null);
        // Seed the demo applicants against whichever two listings exist so
        // the Applicants tab has content even before a real tenant applies.
        if (rows.length > 0) {
          setApplications((prev) => {
            if (prev.length > 0) return prev;
            const [first, second] = rows;
            const seeded: Application[] = [
              { id: "app-seed-1", propertyId: first.id, tenantId: "demo-tenant-priya", status: "approved", appliedAt: "2026-08-01T10:00:00Z" },
              { id: "app-seed-2", propertyId: first.id, tenantId: "demo-tenant-jordan", status: "pending", appliedAt: "2026-08-10T14:30:00Z" },
            ];
            if (second) {
              seeded.push({ id: "app-seed-3", propertyId: second.id, tenantId: "demo-tenant-casey", status: "pending", appliedAt: "2026-08-12T09:15:00Z" });
            }
            return seeded;
          });
        }
      })
      .catch((err) => {
        if (ignore) return;
        setPropertiesError(err instanceof Error ? err.message : "Could not load properties.");
      })
      .finally(() => {
        if (!ignore) setPropertiesLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadTick]);

  const refreshProperties = useCallback(() => {
    setPropertiesLoading(true);
    setReloadTick((n) => n + 1);
  }, []);

  const syncOwnProfile = useCallback(
    (override?: VerificationResult) => {
      if (!user || role !== "tenant") return;
      const effectiveStatus = override?.status ?? verificationStatus;
      const effectiveData = override ? override.data : verificationData;
      setTenants((prev) => {
        const existing = prev[user.id];
        const isVerified = effectiveStatus === "verified" && !!effectiveData;
        const next: TenantProfile = {
          id: user.id,
          name: existing?.name ?? nameFromEmail(user.email ?? "tenant"),
          email: user.email ?? existing?.email ?? "",
          identityStatus: isVerified ? "verified" : effectiveStatus === "processing" ? "pending" : "unverified",
          identityDetails: isVerified ? "Bank-verified identity via Plaid" : "Awaiting bank verification",
          monthlyVerifiedIncome: isVerified ? effectiveData?.income?.predicted_monthly_income ?? 0 : 0,
          annualVerifiedIncome: isVerified ? (effectiveData?.income?.predicted_monthly_income ?? 0) * 12 : 0,
          creditScore: existing?.creditScore ?? 0,
          creditTier: existing?.creditTier ?? "Not Available",
          creditUtilization: existing?.creditUtilization ?? 0,
          bankAccounts: isVerified
            ? (effectiveData?.balances ?? []).map((b, idx) => ({
                id: b.account_id,
                institutionName: effectiveData?.item?.institution_name ?? "Linked Bank",
                accountName: b.account_name ?? "Linked Account",
                accountType: (b.account_subtype === "credit card" ? "credit" : b.account_subtype === "savings" ? "savings" : "checking") as BankAccount["accountType"],
                mask: b.account_id.slice(-4),
                balance: b.current_balance ?? b.available_balance ?? 0,
                isPrimary: idx === 0,
              }))
            : [],
          transactions: existing?.transactions ?? [],
        };
        return { ...prev, [user.id]: next };
      });
    },
    [user, role, verificationStatus, verificationData]
  );

  const addProperty: PropertyContextType["addProperty"] = useCallback(
    async (newProp, criteria) => {
      if (!accessToken || role !== "landlord") {
        return { ok: false, message: "You must be logged in as a landlord to list a property." };
      }
      try {
        const created = await apiCreateProperty(accessToken, { ...newProp, criteria });
        setProperties((prev) => [created, ...prev]);
        return { ok: true, message: "Property listed." };
      } catch (err) {
        return { ok: false, message: err instanceof Error ? err.message : "Could not create property." };
      }
    },
    [accessToken, role]
  );

  const deleteProperty: PropertyContextType["deleteProperty"] = useCallback(
    async (id) => {
      if (!accessToken) return { ok: false, message: "You must be logged in." };
      try {
        await deletePropertyRecord(accessToken, id);
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setApplications((prev) => prev.filter((a) => a.propertyId !== id));
        return { ok: true, message: "Property removed." };
      } catch (err) {
        return { ok: false, message: err instanceof Error ? err.message : "Could not delete property." };
      }
    },
    [accessToken]
  );

  const updatePropertyCriteria: PropertyContextType["updatePropertyCriteria"] = useCallback(
    async (id, criteria) => {
      if (!accessToken) return { ok: false, message: "You must be logged in." };
      try {
        const updated = await apiUpdatePropertyCriteria(accessToken, id, criteria);
        setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return { ok: true, message: "Requirements saved." };
      } catch (err) {
        return { ok: false, message: err instanceof Error ? err.message : "Could not save requirements." };
      }
    },
    [accessToken]
  );

  const applyToProperty = useCallback(
    (propertyId: string): { ok: boolean; message: string } => {
      if (!user || role !== "tenant") {
        return { ok: false, message: "You must be logged in as a tenant to apply." };
      }
      let alreadyApplied = false;
      setApplications((prev) => {
        if (prev.some((a) => a.tenantId === user.id && a.propertyId === propertyId)) {
          alreadyApplied = true;
          return prev;
        }
        return [
          ...prev,
          {
            id: `app-${Date.now()}`,
            propertyId,
            tenantId: user.id,
            status: "pending",
            appliedAt: new Date().toISOString(),
          },
        ];
      });
      // Capture the applicant's current verification state into the shared
      // pool so the landlord's checklist has something to read immediately.
      syncOwnProfile();
      if (alreadyApplied) return { ok: false, message: "You've already applied to this property." };
      return { ok: true, message: "Application submitted." };
    },
    [user, role, syncOwnProfile]
  );

  const hasAppliedTo = useCallback(
    (propertyId: string) => {
      if (!user) return false;
      return applications.some((a) => a.tenantId === user.id && a.propertyId === propertyId);
    },
    [applications, user]
  );

  const approveApplication = (applicationId: string) => {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "approved" } : a)));
  };

  const rejectApplication = (applicationId: string) => {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "rejected" } : a)));
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        propertiesLoading,
        propertiesError,
        refreshProperties,
        addProperty,
        deleteProperty,
        updatePropertyCriteria,
        tenants,
        applications,
        applyToProperty,
        hasAppliedTo,
        approveApplication,
        rejectApplication,
        syncOwnProfile,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperties must be used within a PropertyProvider");
  }
  return context;
};
