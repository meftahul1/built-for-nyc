"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProperties, TenantProfile, BankAccount } from "@/context/PropertyContext";
import { useAuth } from "@/context/AuthContext";
import { useVerification } from "@/context/VerificationContext";
import {
  ShieldCheck,
  BadgeCheck,
  Building2,
  Lock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  Sparkles,
  ShieldAlert,
  Clock,
} from "lucide-react";

function TenantDashboardContent() {
  const searchParams = useSearchParams();
  const { tenants, hasAppliedToLandlord } = useProperties();
  const { accessToken } = useAuth();
  const { status: verificationStatus, data: verificationData, refreshStatus } = useVerification();

  // Parse URL query params
  const requestedTenantId = searchParams.get("tenantId") || "tenant-me";
  const isViewingAsLandlord = searchParams.get("asLandlord") === "true";

  // Only the logged-in tenant viewing their own passport gets live Plaid data —
  // the backend scopes /plaid/* to the caller's own JWT, so a landlord peeking
  // at another tenant's ID still falls back to the mock passport below.
  const isOwnLiveView = !isViewingAsLandlord && requestedTenantId === "tenant-me" && !!accessToken;

  useEffect(() => {
    if (isOwnLiveView) {
      refreshStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnLiveView, accessToken]);

  // Lookup requested tenant profile
  const baseTenant: TenantProfile | undefined = tenants[requestedTenantId] || tenants["tenant-me"];

  // Merge live Plaid verification data (income + balances) over the mock
  // profile once it's available. Fields the backend doesn't provide yet
  // (credit score, transaction history) stay on the mock passport.
  const tenant: TenantProfile = useMemo(() => {
    if (!isOwnLiveView || !verificationData) return baseTenant;

    const liveBankAccounts: BankAccount[] | null = verificationData.balances.length
      ? verificationData.balances.map((b, idx) => ({
          id: b.account_id,
          institutionName: verificationData.item?.institution_name ?? "Linked Bank",
          accountName: b.account_name ?? "Linked Account",
          accountType: (b.account_subtype === "credit card" ? "credit" : b.account_subtype === "savings" ? "savings" : "checking") as BankAccount["accountType"],
          mask: b.account_id.slice(-4),
          balance: b.current_balance ?? b.available_balance ?? 0,
          isPrimary: idx === 0,
        }))
      : null;

    const monthlyIncome = verificationData.income?.predicted_monthly_income;

    return {
      ...baseTenant,
      monthlyVerifiedIncome: monthlyIncome ?? baseTenant.monthlyVerifiedIncome,
      annualVerifiedIncome: monthlyIncome ? monthlyIncome * 12 : baseTenant.annualVerifiedIncome,
      bankAccounts: liveBankAccounts ?? baseTenant.bankAccounts,
    };
  }, [isOwnLiveView, verificationData, baseTenant]);

  // Access Control check
  const isAllowedToView =
    !isViewingAsLandlord || (isViewingAsLandlord && hasAppliedToLandlord(tenant.id));

  // Compute total liquid assets
  const totalAssets = tenant.bankAccounts
    .filter((b) => b.accountType !== "credit")
    .reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans pb-24">
      {/* Top Banner */}
      <section className="bg-white border-b border-neutral-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={tenant.avatar}
              alt={tenant.name}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-rose-100 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {tenant.name}
                </h1>
                {isOwnLiveView && verificationStatus !== "verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    <Clock className="h-4 w-4 text-amber-600" />
                    {verificationStatus === "processing" ? "Verification Processing" : "Not Yet Verified"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    Plaid Verified Passport
                  </span>
                )}
              </div>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-medium">
                {tenant.email} • {tenant.identityDetails}
              </p>
            </div>
          </div>

          {/* Banner CTAs / Status Badges */}
          <div className="flex items-center gap-3">
            {isViewingAsLandlord ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-800">
                <Building2 className="h-4 w-4 text-blue-600" />
                Landlord View Mode
              </div>
            ) : (
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Browse Homes & Share Passport
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ACCESS CONTROL RESTRICTED VIEW IF LANDLORD NOT PERMITTED */}
        {!isAllowedToView ? (
          <div className="rounded-3xl border border-rose-200 bg-white p-12 text-center airbnb-shadow flex flex-col items-center justify-center gap-5 my-12">
            <div className="h-20 w-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-[#FF385C]">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-extrabold text-neutral-900">Access Restricted</h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                This tenant has not applied to any of your landlord property listings or granted permission to share their MiddleMan verification passport with your account.
              </p>
            </div>
            <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200 text-xs text-neutral-500 max-w-sm">
              <p className="font-bold text-neutral-700">How MiddleMan Privacy Works:</p>
              Tenants retain full control over their financial records. Document passports are only accessible after an explicit property application is submitted.
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3 text-xs font-bold text-white hover:bg-neutral-800 transition-colors"
            >
              Return to Landlord Dashboard
            </Link>
          </div>
        ) : (
          /* FULL FINTECH VERIFIED DASHBOARD */
          <>
            {/* Prompt the logged-in tenant to finish Plaid verification if they haven't yet */}
            {isOwnLiveView && (verificationStatus === "unverified" || verificationStatus === "processing" || verificationStatus === "failed") && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-bold text-amber-900">
                <div className="flex items-center gap-2">
                  {verificationStatus === "processing" ? (
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  )}
                  {verificationStatus === "processing"
                    ? "Plaid is verifying your income — this can take a minute. The figures below are placeholders until it completes."
                    : verificationStatus === "failed"
                    ? "Your last verification attempt failed. Reconnect your bank to refresh your passport."
                    : "You haven't connected a bank account yet. The figures below are sample data — verify to replace them with your real numbers."}
                </div>
                <Link
                  href="/verify"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-[11px] font-bold text-white hover:bg-amber-700 transition-colors flex-shrink-0"
                >
                  {verificationStatus === "processing" ? "Check Again" : "Verify with Plaid"}
                </Link>
              </div>
            )}

            {/* Landlord Access Banner if viewing as Landlord */}
            {isViewingAsLandlord && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-xs font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  Verified Applicant Passport — Shared with your property listing!
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Plaid Signature Valid
                </span>
              </div>
            )}

            {/* TOP FINTECH METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Verified Income */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Verified Income
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                    ${tenant.monthlyVerifiedIncome.toLocaleString()}
                    <span className="text-xs font-semibold text-neutral-400">/mo</span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ${tenant.annualVerifiedIncome.toLocaleString()}/yr Plaid Sync
                  </p>
                </div>
              </div>

              {/* Card 2: Liquid Balances */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Liquid Assets
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Landmark className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                    ${totalAssets.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-neutral-500 mt-1">
                    Across {tenant.bankAccounts.filter((b) => b.accountType !== "credit").length} Linked Accounts
                  </p>
                </div>
              </div>

              {/* Card 3: Credit Score */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Credit Score Range
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                      {tenant.creditScore}
                    </p>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {tenant.creditTier}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 mt-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(tenant.creditScore / 850) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Card 4: Credit Utilization */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Credit Utilization
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                    {tenant.creditUtilization}%
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Low Risk (Under 30% Benchmark)
                  </p>
                </div>
              </div>
            </div>

            {/* MAIN TWO COLUMN FINTECH SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 Columns: Bank Accounts & Verification Records */}
              <div className="lg:col-span-7 space-y-6">
                {/* Linked Bank Accounts */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-neutral-900 text-lg">Plaid Linked Financial Accounts</h3>
                      <p className="text-xs text-neutral-500">Read-only encrypted connection</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-Bit Encrypted
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tenant.bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-xs">
                            {account.institutionName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-neutral-900 text-sm">{account.institutionName}</p>
                              {account.isPrimary && (
                                <span className="text-[10px] font-bold bg-rose-50 text-[#FF385C] px-2 py-0.5 rounded-full">
                                  Payroll Account
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">
                              {account.accountName} •••• {account.mask}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-neutral-900 text-sm tabular-nums">
                            {account.accountType === "credit" ? "-" : ""}${account.balance.toLocaleString()}
                          </p>
                          <p className="text-[11px] font-semibold capitalize text-neutral-400">
                            {account.accountType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plaid Verification Passport Highlights */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow space-y-4">
                  <h3 className="font-extrabold text-neutral-900 text-lg">MiddleMan Audit Guarantee</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-emerald-900">Direct Payroll Verified</p>
                        <p className="text-[11px] text-emerald-700">No PDF modifications detected</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-blue-900">State Biometrics Cleared</p>
                        <p className="text-[11px] text-blue-700">Name & SSN match 99.8%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Recent Plaid Transaction Ledger */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-neutral-900 text-lg">Transaction Ledger</h3>
                      <p className="text-xs text-neutral-500">Plaid 90-Day Direct Feed</p>
                    </div>
                    <span className="text-xs font-bold text-neutral-400">Verified Sync</span>
                  </div>

                  <div className="space-y-3">
                    {tenant.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                              tx.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-[#FF385C]"
                            }`}
                          >
                            {tx.type === "credit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 text-xs">{tx.name}</p>
                            <p className="text-[11px] text-neutral-400">{tx.date} • {tx.category}</p>
                          </div>
                        </div>

                        <span
                          className={`font-extrabold text-xs tabular-nums ${
                            tx.type === "credit" ? "text-emerald-600" : "text-neutral-900"
                          }`}
                        >
                          {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function TenantDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm font-semibold text-neutral-500">
          Loading Tenant Verification Passport…
        </div>
      }
    >
      <TenantDashboardContent />
    </Suspense>
  );
}
