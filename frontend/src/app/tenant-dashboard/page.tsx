"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BankAccount, Transaction, useProperties } from "@/context/PropertyContext";
import { useAuth } from "@/context/AuthContext";
import { useVerification } from "@/context/VerificationContext";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import {
  ShieldCheck,
  BadgeCheck,
  Lock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  Sparkles,
  ShieldAlert,
  Clock,
  Info,
} from "lucide-react";

// Illustrative numbers shown (clearly labeled) before a tenant has connected
// a bank account, so the dashboard doesn't look empty on first visit.
const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2026-08-01", name: "Direct Deposit / Employer", category: "Payroll", amount: 4725.0, type: "credit" },
  { id: "t2", date: "2026-07-15", name: "Direct Deposit / Employer", category: "Payroll", amount: 4725.0, type: "credit" },
  { id: "t3", date: "2026-07-01", name: "Rent Payment", category: "Rent", amount: 3500.0, type: "debit" },
];

const SAMPLE_MONTHLY_INCOME = 9450;

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Tenant";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TenantDashboardPage() {
  const router = useRouter();
  const { user, role, accessToken, loading: authLoading } = useAuth();
  const { status: verificationStatus, data: verificationData, refreshStatus } = useVerification();
  const { syncOwnProfile } = useProperties();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role !== "tenant") {
      router.replace("/landlord");
    }
  }, [authLoading, user, role, router]);

  useEffect(() => {
    if (accessToken) refreshStatus().then((result) => syncOwnProfile(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const isVerified = verificationStatus === "verified" && !!verificationData;

  const name = useMemo(() => (user?.email ? nameFromEmail(user.email) : "Tenant"), [user]);

  const bankAccounts: BankAccount[] = useMemo(() => {
    if (!isVerified) return [];
    return (verificationData?.balances ?? []).map((b, idx) => ({
      id: b.account_id,
      institutionName: verificationData?.item?.institution_name ?? "Linked Bank",
      accountName: b.account_name ?? "Linked Account",
      accountType: (b.account_subtype === "credit card" ? "credit" : b.account_subtype === "savings" ? "savings" : "checking") as BankAccount["accountType"],
      mask: b.account_id.slice(-4),
      balance: b.current_balance ?? b.available_balance ?? 0,
      isPrimary: idx === 0,
    }));
  }, [isVerified, verificationData]);

  const monthlyIncome = isVerified ? verificationData?.income?.predicted_monthly_income ?? 0 : SAMPLE_MONTHLY_INCOME;
  const annualIncome = monthlyIncome * 12;
  const totalAssets = bankAccounts.filter((b) => b.accountType !== "credit").reduce((sum, b) => sum + b.balance, 0);

  if (authLoading || !user || role !== "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm font-semibold text-neutral-500">
        Loading your passport…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans pb-24">
      {/* Top Banner */}
      <section className="bg-white border-b border-neutral-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <InitialsAvatar name={name} className="h-16 w-16 text-lg border-2 border-rose-100 shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">{name}</h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    Plaid Verified Passport
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    <Clock className="h-4 w-4 text-amber-600" />
                    {verificationStatus === "processing" ? "Verification Processing" : "Not Yet Verified"}
                  </span>
                )}
              </div>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-medium">{user.email}</p>
            </div>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            Browse Homes & Apply
          </Link>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {!isVerified && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-bold text-amber-900">
            <div className="flex items-center gap-2">
              {verificationStatus === "processing" ? (
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
              )}
              {verificationStatus === "processing"
                ? "Plaid is verifying your income — this can take a minute. The figures below are sample data until it completes."
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

        <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p>
            This dashboard is private to you. When you apply to a listing, landlords only see a pass/fail requirements
            checklist derived from this data — never your account numbers, balances, or transaction history.
          </p>
        </div>

        {/* TOP FINTECH METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Verified Income</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                ${monthlyIncome.toLocaleString()}
                <span className="text-xs font-semibold text-neutral-400">/mo</span>
              </p>
              <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ${annualIncome.toLocaleString()}/yr {isVerified ? "Plaid Sync" : "(sample)"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Liquid Assets</span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                {isVerified ? `$${totalAssets.toLocaleString()}` : "—"}
              </p>
              <p className="text-xs font-semibold text-neutral-500 mt-1">
                {isVerified
                  ? `Across ${bankAccounts.filter((b) => b.accountType !== "credit").length} linked account(s)`
                  : "Connect your bank to see this"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Credit Check</span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-lg font-extrabold text-neutral-500">Not part of this verification</p>
              <p className="text-xs font-semibold text-neutral-400 mt-1">Landlords assess income & identity only</p>
            </div>
          </div>
        </div>

        {/* MAIN TWO COLUMN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-lg">Plaid Linked Financial Accounts</h3>
                  <p className="text-xs text-neutral-500">Read-only encrypted connection · visible only to you</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-Bit Encrypted
                </span>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-xs text-neutral-500">
                  {isVerified ? "No linked accounts returned." : "Connect your bank with Plaid to see your accounts here."}
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((account) => (
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
                        <p className="text-[11px] font-semibold capitalize text-neutral-400">{account.accountType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isVerified && (
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow space-y-4">
                <h3 className="font-extrabold text-neutral-900 text-lg">MiddleMan Audit Guarantee</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-900">Direct Bank Income Verified</p>
                      <p className="text-[11px] text-emerald-700">Confirmed via Plaid Bank Income</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-blue-900">Identity Verified</p>
                      <p className="text-[11px] text-blue-700">Confirmed by MiddleMan</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-lg">Transaction Ledger</h3>
                  <p className="text-xs text-neutral-500">{isVerified ? "Not shared with landlords" : "Sample preview"}</p>
                </div>
                <ShieldCheck className="h-4 w-4 text-neutral-300" />
              </div>

              {isVerified ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-xs text-neutral-500">
                  Itemized transactions aren&apos;t collected — only your verified income summary is used.
                </div>
              ) : (
                <div className="space-y-3">
                  {SAMPLE_TRANSACTIONS.map((tx) => (
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
                          <p className="text-[11px] text-neutral-400">
                            {tx.date} • {tx.category}
                          </p>
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
