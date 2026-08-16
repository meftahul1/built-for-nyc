"use client";

import React, { createContext, useContext, useState } from "react";

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
  avatar: string;
  identityStatus: "verified" | "pending" | "unverified";
  identityDetails: string;
  monthlyVerifiedIncome: number;
  annualVerifiedIncome: number;
  creditScore: number;
  creditTier: string;
  creditUtilization: number;
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  hasAppliedToProperties: string[]; // List of property IDs this tenant applied to
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
  },
];

const MOCK_TENANTS: Record<string, TenantProfile> = {
  "tenant-me": {
    id: "tenant-me",
    name: "Alex Rivera (You)",
    email: "alex.rivera@example.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    identityStatus: "verified",
    identityDetails: "NY Driver License #****4912 (SSN Verified)",
    monthlyVerifiedIncome: 9450,
    annualVerifiedIncome: 113400,
    creditScore: 765,
    creditTier: "Tier 1 Excellent",
    creditUtilization: 12,
    bankAccounts: [
      { id: "b1", institutionName: "Chase Bank", accountName: "Total Checking", accountType: "checking", mask: "4912", balance: 14250, isPrimary: true },
      { id: "b2", institutionName: "Marcus by Goldman Sachs", accountName: "High Yield Savings", accountType: "savings", mask: "8821", balance: 42800 },
      { id: "b3", institutionName: "American Express", accountName: "Gold Credit", accountType: "credit", mask: "1004", balance: 1120 },
    ],
    transactions: [
      { id: "t1", date: "2026-08-01", name: "Stripe Direct Deposit / Tech Corp", category: "Payroll", amount: 4725.00, type: "credit" },
      { id: "t2", date: "2026-07-15", name: "Stripe Direct Deposit / Tech Corp", category: "Payroll", amount: 4725.00, type: "credit" },
      { id: "t3", date: "2026-07-01", name: "West Village Realty / Rent Payment", category: "Rent", amount: 3500.00, type: "debit" },
      { id: "t4", date: "2026-06-15", name: "Stripe Direct Deposit / Tech Corp", category: "Payroll", amount: 4725.00, type: "credit" },
    ],
    hasAppliedToProperties: ["prop-1", "prop-3"],
  },
  "tenant-[#002]": {
    id: "tenant-#002",
    name: "Jordan Vance",
    email: "jordan.vance@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    identityStatus: "verified",
    identityDetails: "CA State Passport #****8810 (Verified)",
    monthlyVerifiedIncome: 11200,
    annualVerifiedIncome: 134400,
    creditScore: 780,
    creditTier: "Tier 1 Excellent",
    creditUtilization: 8,
    bankAccounts: [
      { id: "b4", institutionName: "Bank of America", accountName: "Advantage Checking", accountType: "checking", mask: "9914", balance: 18900, isPrimary: true },
      { id: "b5", institutionName: "Fidelity Investments", accountName: "Cash Management", accountType: "savings", mask: "3310", balance: 65400 },
    ],
    transactions: [
      { id: "t5", date: "2026-08-01", name: "Google Payroll Direct Deposit", category: "Payroll", amount: 5600.00, type: "credit" },
      { id: "t6", date: "2026-07-15", name: "Google Payroll Direct Deposit", category: "Payroll", amount: 5600.00, type: "credit" },
    ],
    hasAppliedToProperties: ["prop-1"],
  },
  "tenant-unapplied": {
    id: "tenant-unapplied",
    name: "Unapplied Private Tenant",
    email: "private.tenant@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    identityStatus: "verified",
    identityDetails: "Verified Identity (Private)",
    monthlyVerifiedIncome: 12500,
    annualVerifiedIncome: 150000,
    creditScore: 790,
    creditTier: "Tier 1",
    creditUtilization: 5,
    bankAccounts: [],
    transactions: [],
    hasAppliedToProperties: [], // Has NOT applied to landlord properties!
  },
};

interface PropertyContextType {
  properties: Property[];
  addProperty: (newProp: Omit<Property, "id" | "verifiedStatus" | "landlordName" | "landlordAvatar" | "landlordRating" | "landlordResponseTime" | "verifiedFeatures" | "isLandlordProperty">) => void;
  deleteProperty: (id: string) => void;
  tenants: Record<string, TenantProfile>;
  applyToProperty: (propertyId: string, tenantId?: string) => void;
  hasAppliedToLandlord: (tenantId: string, propertyId?: string) => boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [tenants, setTenants] = useState<Record<string, TenantProfile>>(MOCK_TENANTS);

  const addProperty = (
    newProp: Omit<Property, "id" | "verifiedStatus" | "landlordName" | "landlordAvatar" | "landlordRating" | "landlordResponseTime" | "verifiedFeatures" | "isLandlordProperty">
  ) => {
    const created: Property = {
      ...newProp,
      id: `prop-${Date.now()}`,
      verifiedStatus: "verified",
      landlordName: "Sarah Jenkins (You)",
      landlordAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      landlordRating: 5.0,
      landlordResponseTime: "Instant",
      verifiedFeatures: ["Income Verified", "Plaid Bank Sync", "Owner Document Verified"],
      isLandlordProperty: true,
    };
    setProperties((prev) => [created, ...prev]);
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const applyToProperty = (propertyId: string, tenantId: string = "tenant-me") => {
    setTenants((prev) => {
      const currentTenant = prev[tenantId];
      if (!currentTenant) return prev;
      if (currentTenant.hasAppliedToProperties.includes(propertyId)) return prev;
      return {
        ...prev,
        [tenantId]: {
          ...currentTenant,
          hasAppliedToProperties: [...currentTenant.hasAppliedToProperties, propertyId],
        },
      };
    });
  };

  const hasAppliedToLandlord = (tenantId: string) => {
    const tenant = tenants[tenantId];
    if (!tenant) return false;
    // Check if tenant has applied to any landlord property
    const landlordPropIds = properties.filter((p) => p.isLandlordProperty).map((p) => p.id);
    return tenant.hasAppliedToProperties.some((pId) => landlordPropIds.includes(pId));
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        addProperty,
        deleteProperty,
        tenants,
        applyToProperty,
        hasAppliedToLandlord,
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
