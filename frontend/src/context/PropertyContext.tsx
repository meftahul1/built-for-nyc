"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useVerification, VerificationResult } from "@/context/VerificationContext";

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

export interface Property {
  id: string;
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
  additionalImages?: string[];
  verifiedStatus: "verified" | "pending" | "unverified";
  landlordName: string;
  landlordAvatar: string;
  landlordRating: number;
  landlordResponseTime: string;
  verifiedFeatures: string[];
  isLandlordProperty?: boolean;
  criteria: TenantCriteria;
}

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

const INITIAL_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "The Glass House Loft & Terrace",
    address: "248 Mercer St, Soho",
    city: "New York",
    state: "NY",
    price: 4200,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1150,
    description: "Sun-drenched Soho loft featuring 11ft ceilings, floor-to-ceiling double-glazed windows, private elevator access, and a lush private roof terrace with skyline views.",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    verifiedStatus: "verified",
    landlordName: "Sarah Jenkins",
    landlordAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    landlordRating: 4.96,
    landlordResponseTime: "under 1 hour",
    verifiedFeatures: ["Income Verified", "Instant Plaid Check", "Clean Ownership Records", "Zero Eviction History"],
    isLandlordProperty: true,
    criteria: { ...DEFAULT_CRITERIA, minIncomeMultiplier: 3, minCreditScore: 680, notes: "No smoking. Renters insurance required at move-in." },
  },
  {
    id: "prop-2",
    title: "Minimalist Modern Townhouse",
    address: "112 Perry Street, West Village",
    city: "New York",
    state: "NY",
    price: 5800,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1650,
    description: "Historic West Village brownstone floor-through with modern chef's kitchen, exposed brick hearth, central HVAC, and serene garden view.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    verifiedStatus: "verified",
    landlordName: "Marcus Sterling",
    landlordAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    landlordRating: 4.92,
    landlordResponseTime: "within a few hours",
    verifiedFeatures: ["Deed Verified", "Income Pre-Screened", "Background Verified"],
    isLandlordProperty: false,
    criteria: { ...DEFAULT_CRITERIA, minIncomeMultiplier: 2.5, minCreditScore: 620, petsAllowed: true, requireBackgroundCheck: false },
  },
  {
    id: "prop-3",
    title: "Waterfront Architectural Haven",
    address: "88 N 6th St, Williamsburg",
    city: "Brooklyn",
    state: "NY",
    price: 3650,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 820,
    description: "Sleek industrial penthouse with custom oak cabinetry, smart lighting system, in-unit washer/dryer, and full building concierge amenities.",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    verifiedStatus: "verified",
    landlordName: "Elena Rostova",
    landlordAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    landlordRating: 5.0,
    landlordResponseTime: "under 15 minutes",
    verifiedFeatures: ["Plaid Bank Income Sync", "ID Verified", "Rental Ledger Cleared"],
    isLandlordProperty: true,
    criteria: { ...DEFAULT_CRITERIA, minIncomeMultiplier: 3, minCreditScore: 700 },
  },
];

// Seed applicant fixtures so the landlord Applicants tab has demo content
// before any real tenant has applied. Real tenants get their own profile
// (keyed by their Supabase user id) created the moment they apply.
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

const SEED_APPLICATIONS: Application[] = [
  { id: "app-seed-1", propertyId: "prop-1", tenantId: "demo-tenant-priya", status: "approved", appliedAt: "2026-08-01T10:00:00Z" },
  { id: "app-seed-2", propertyId: "prop-1", tenantId: "demo-tenant-jordan", status: "pending", appliedAt: "2026-08-10T14:30:00Z" },
  { id: "app-seed-3", propertyId: "prop-3", tenantId: "demo-tenant-casey", status: "pending", appliedAt: "2026-08-12T09:15:00Z" },
];

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
  addProperty: (
    newProp: Omit<Property, "id" | "verifiedStatus" | "landlordName" | "landlordAvatar" | "landlordRating" | "landlordResponseTime" | "verifiedFeatures" | "isLandlordProperty" | "criteria">,
    criteria: TenantCriteria
  ) => void;
  deleteProperty: (id: string) => void;
  updatePropertyCriteria: (id: string, criteria: TenantCriteria) => void;
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
  const { user, role } = useAuth();
  const { status: verificationStatus, data: verificationData } = useVerification();

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [tenants, setTenants] = useState<Record<string, TenantProfile>>(SEED_TENANTS);
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);

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

  const addProperty: PropertyContextType["addProperty"] = (newProp, criteria) => {
    const created: Property = {
      ...newProp,
      id: `prop-${Date.now()}`,
      verifiedStatus: "verified",
      landlordName: "You",
      landlordAvatar: "",
      landlordRating: 5.0,
      landlordResponseTime: "Instant",
      verifiedFeatures: ["Income Verified", "Plaid Bank Sync", "Owner Document Verified"],
      isLandlordProperty: true,
      criteria,
    };
    setProperties((prev) => [created, ...prev]);
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setApplications((prev) => prev.filter((a) => a.propertyId !== id));
  };

  const updatePropertyCriteria = (id: string, criteria: TenantCriteria) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, criteria } : p)));
  };

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
