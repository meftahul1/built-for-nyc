"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useVerification, VerificationResult } from "@/context/VerificationContext";
import { useIdentity, IdentityResult } from "@/context/IdentityContext";
import {
  listProperties,
  createProperty as apiCreateProperty,
  updatePropertyCriteria as apiUpdatePropertyCriteria,
  deletePropertyRecord,
  applyToPropertyApi,
  getMyApplications,
  getLandlordApplications,
  updateApplicationStatus as apiUpdateApplicationStatus,
  PropertyRecord,
  ApplicationRecord,
  TenantProfileDto,
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

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Tenant";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapApplication(a: ApplicationRecord): Application {
  return { id: a.id, propertyId: a.propertyId, tenantId: a.tenantId, status: a.status, appliedAt: a.appliedAt };
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
  applicationsLoading: boolean;
  applyToProperty: (propertyId: string) => Promise<{ ok: boolean; message: string }>;
  hasAppliedTo: (propertyId: string) => boolean;
  approveApplication: (applicationId: string) => Promise<{ ok: boolean; message: string }>;
  rejectApplication: (applicationId: string) => Promise<{ ok: boolean; message: string }>;
  /** Snapshots the current tenant's Plaid income and Stripe Identity
   * verification state into the shared applicant pool a landlord's checklist
   * reads from. Call this after any action that can change verification
   * status — applying, finishing Plaid Link, or returning from Stripe
   * Identity. Pass `overrides` when calling right after an awaited
   * verification call (e.g. `refreshStatus()`/`completeLink()`) so the write
   * uses that call's actual result instead of a context closure that may not
   * have re-rendered yet. */
  syncOwnProfile: (overrides?: { verification?: VerificationResult; identity?: IdentityResult }) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, accessToken } = useAuth();
  const { status: verificationStatus, data: verificationData } = useVerification();
  const { status: identityStatus, data: identityData } = useIdentity();

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [tenants, setTenants] = useState<Record<string, TenantProfile>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

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

  // Applications are persisted server-side (`rental_applications`) — a
  // tenant sees their own, a landlord sees every applicant across their
  // properties (with each applicant's verification summary attached). This
  // is what survives a page refresh, unlike the old client-only demo state.
  useEffect(() => {
    let ignore = false;

    type FetchResult = { applications: Application[]; tenants?: Record<string, TenantProfileDto> };

    Promise.resolve()
      .then((): FetchResult | Promise<FetchResult> | null => {
        if (ignore) return null;
        if (!user || !accessToken) return { applications: [] };
        setApplicationsLoading(true);
        if (role === "landlord") {
          return getLandlordApplications(accessToken).then((res) => ({
            applications: res.applications.map(mapApplication),
            tenants: res.tenants,
          }));
        }
        return getMyApplications(accessToken).then((res) => ({ applications: res.map(mapApplication) }));
      })
      .then((result) => {
        if (ignore || !result) return;
        setApplications(result.applications);
        const tenantEntries = result.tenants;
        if (tenantEntries) {
          setTenants((prev) => {
            const next = { ...prev };
            for (const [tenantId, profile] of Object.entries(tenantEntries)) {
              next[tenantId] = { ...profile, bankAccounts: [], transactions: [] };
            }
            return next;
          });
        }
      })
      .catch(() => {
        if (!ignore) setApplications([]);
      })
      .finally(() => {
        if (!ignore) setApplicationsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user, accessToken, role]);

  const syncOwnProfile = useCallback(
    (overrides?: { verification?: VerificationResult; identity?: IdentityResult }) => {
      if (!user || role !== "tenant") return;
      const effectiveStatus = overrides?.verification?.status ?? verificationStatus;
      const effectiveData = overrides?.verification ? overrides.verification.data : verificationData;
      const effectiveIdentityStatus = overrides?.identity?.status ?? identityStatus;
      const effectiveIdentityData = overrides?.identity ? overrides.identity.data : identityData;
      setTenants((prev) => {
        const existing = prev[user.id];
        const isVerified = effectiveStatus === "verified" && !!effectiveData;
        const isIdentityVerified = effectiveIdentityStatus === "verified";
        const next: TenantProfile = {
          id: user.id,
          name: existing?.name ?? nameFromEmail(user.email ?? "tenant"),
          email: user.email ?? existing?.email ?? "",
          identityStatus: isIdentityVerified
            ? "verified"
            : effectiveIdentityStatus === "processing"
            ? "pending"
            : "unverified",
          identityDetails: isIdentityVerified
            ? "Stripe Identity — document verified"
            : effectiveIdentityStatus === "processing"
            ? "Stripe is reviewing your document"
            : effectiveIdentityData?.status === "canceled"
            ? "Stripe Identity check was not completed"
            : "Not yet verified",
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
    [user, role, verificationStatus, verificationData, identityStatus, identityData]
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

  const applyToProperty: PropertyContextType["applyToProperty"] = useCallback(
    async (propertyId) => {
      if (!user || role !== "tenant" || !accessToken) {
        return { ok: false, message: "You must be logged in as a tenant to apply." };
      }
      if (applications.some((a) => a.propertyId === propertyId)) {
        return { ok: false, message: "You've already applied to this property." };
      }
      try {
        const created = await applyToPropertyApi(accessToken, propertyId);
        setApplications((prev) => [...prev, mapApplication(created)]);
        // Capture the applicant's current verification state into the
        // shared pool so the landlord's checklist has something to read
        // immediately, without waiting on their next fetch.
        syncOwnProfile();
        return { ok: true, message: "Application submitted." };
      } catch (err) {
        return { ok: false, message: err instanceof Error ? err.message : "Could not submit application." };
      }
    },
    [user, role, accessToken, applications, syncOwnProfile]
  );

  const hasAppliedTo = useCallback(
    (propertyId: string) => {
      if (!user) return false;
      return applications.some((a) => a.propertyId === propertyId);
    },
    [applications, user]
  );

  const setApplicationStatus = useCallback(
    async (applicationId: string, status: "approved" | "rejected") => {
      if (!accessToken) return { ok: false, message: "You must be logged in." };
      try {
        const updated = await apiUpdateApplicationStatus(accessToken, applicationId, status);
        setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: updated.status } : a)));
        return { ok: true, message: status === "approved" ? "Application approved." : "Application rejected." };
      } catch (err) {
        return { ok: false, message: err instanceof Error ? err.message : "Could not update application." };
      }
    },
    [accessToken]
  );

  const approveApplication = useCallback(
    (applicationId: string) => setApplicationStatus(applicationId, "approved"),
    [setApplicationStatus]
  );

  const rejectApplication = useCallback(
    (applicationId: string) => setApplicationStatus(applicationId, "rejected"),
    [setApplicationStatus]
  );

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
        applicationsLoading,
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
