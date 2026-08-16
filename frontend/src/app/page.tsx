"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  UserCheck,
  FileCheck2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ChevronDown,
  Star,
  Zap,
  Building,
  Eye,
  BadgeCheck,
} from "lucide-react";

export default function Home() {
  // Interactive Verification Demo Widget State
  const [activeDemoTab, setActiveDemoTab] = useState<"income" | "identity" | "rental" | "credit">("income");
  const [isVerifyingDemo, setIsVerifyingDemo] = useState(false);
  const [demoVerified, setDemoVerified] = useState(false);

  // How it works tab state (Tenant vs Landlord)
  const [activeUserRole, setActiveUserRole] = useState<"tenant" | "landlord">("tenant");

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const triggerDemoVerify = () => {
    setIsVerifyingDemo(true);
    setDemoVerified(false);
    setTimeout(() => {
      setIsVerifyingDemo(false);
      setDemoVerified(true);
    }, 1200);
  };

  const faqs = [
    {
      q: "How does MiddleMan verify income without manual paystubs?",
      a: "MiddleMan connects directly with tenant financial institutions via encrypted bank APIs (Plaid). It automatically analyzes recurring payroll deposits and calculates verified average monthly income in under 60 seconds.",
    },
    {
      q: "Is sensitive banking or personal data stored on MiddleMan servers?",
      a: "Never. We use 256-bit bank-grade encryption and tokenization. Credentials are processed via read-only bank tokens, ensuring landlords only see verified income totals without accessing your account numbers or passwords.",
    },
    {
      q: "How do landlords benefit from MiddleMan verification?",
      a: "Landlords eliminate fake PDF paystubs and fraudulent applications. MiddleMan delivers a tamper-proof verification passport with guaranteed income math, clean identity checks, and rental ledger confirmation.",
    },
    {
      q: "Is there any cost for tenants to create a verification passport?",
      a: "Creating your basic MiddleMan verification passport is completely free. You can share your verified status with multiple participating landlords without paying repeated application fees.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 font-sans overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Background Decorative Blur Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-200/40 via-amber-100/30 to-purple-100/40 blur-3xl pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-rose-200 bg-rose-50/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#FF385C] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#FF385C]" />
              The Gold Standard in Rental Document Verification
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
              Document verification tenants & landlords <span className="bg-gradient-to-r from-[#FF385C] to-[#E00B41] bg-clip-text text-transparent">actually trust.</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed max-w-2xl">
              Eliminate fake paystubs, manual paperwork, and endless background friction. MiddleMan instantly verifies income, identity, and rental history with bank-level security.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:shadow-[#FF385C]/35 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/properties"
                className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white px-7 py-4 text-base font-semibold text-neutral-800 shadow-sm transition-all hover:bg-neutral-100 hover:border-neutral-400"
              >
                <Building className="h-5 w-5 text-neutral-500" />
                Browse Verified Homes
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-200/80">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">60s</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">Instant Income Audit</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">100%</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">Bank-Direct Sync</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">$0</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">Free for Tenants</p>
              </div>
            </div>
          </div>

          {/* Right Column: Airbnb Card Visual Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-neutral-200/90 bg-white p-6 airbnb-shadow airbnb-shadow-hover relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#FF385C]">
                    <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-900 text-sm">Tenant Verification Card</span>
                      <BadgeCheck className="h-4 w-4 text-[#FF385C] fill-rose-100" />
                    </div>
                    <p className="text-xs text-neutral-500">Live Encrypted Passport</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Active
                </span>
              </div>

              {/* Sample Document Breakdown */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3.5 border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Monthly Direct Deposit</p>
                      <p className="text-[11px] text-neutral-500">Plaid Bank Verified (90 Days)</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-neutral-900 tabular-nums">$9,450/mo</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3.5 border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Government Identity</p>
                      <p className="text-[11px] text-neutral-500">State ID & Biometrics Match</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Pass
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3.5 border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Rental Ledger History</p>
                      <p className="text-[11px] text-neutral-500">24 Months On-Time Payments</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-neutral-900">100% On-Time</span>
                </div>
              </div>

              {/* Bottom Security Note */}
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-neutral-400" />
                  Read-Only Bank Auth
                </span>
                <span className="font-medium text-[#FF385C]">MiddleMan Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & SECURITY BADGES */}
      <section id="trust-security" className="bg-white border-y border-neutral-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-8">
            Powered by Enterprise-Grade Financial Security
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#FF385C]">
                <Lock className="h-6 w-6" />
              </div>
              <p className="font-bold text-neutral-900 text-sm">256-Bit Encryption</p>
              <p className="text-xs text-neutral-500">Bank-level data safety</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Zap className="h-6 w-6" />
              </div>
              <p className="font-bold text-neutral-900 text-sm">Instant Plaid API</p>
              <p className="text-xs text-neutral-500">Direct payroll confirmation</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="font-bold text-neutral-900 text-sm">Zero Paystub Fraud</p>
              <p className="text-xs text-neutral-500">Tamper-proof income records</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="font-bold text-neutral-900 text-sm">Landlord Approved</p>
              <p className="text-xs text-neutral-500">Used by top NYC property managers</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO WIDGET */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Interactive Verification Sandbox
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-3">
            Test the MiddleMan Audit Engine
          </h2>
          <p className="text-neutral-600 text-base mt-2">
            Click through the document checks below to simulate how instant verification works.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 airbnb-shadow">
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-neutral-100 mb-8">
            <button
              onClick={() => { setActiveDemoTab("income"); setDemoVerified(false); }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeDemoTab === "income" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Income Sync
            </button>

            <button
              onClick={() => { setActiveDemoTab("identity"); setDemoVerified(false); }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeDemoTab === "identity" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <UserCheck className="h-4 w-4 text-blue-600" />
              Identity
            </button>

            <button
              onClick={() => { setActiveDemoTab("rental"); setDemoVerified(false); }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeDemoTab === "rental" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <FileCheck2 className="h-4 w-4 text-purple-600" />
              Rental History
            </button>

            <button
              onClick={() => { setActiveDemoTab("credit"); setDemoVerified(false); }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeDemoTab === "credit" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <CreditCard className="h-4 w-4 text-amber-600" />
              Credit Check
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 mb-6">
            {activeDemoTab === "income" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Direct Payroll & Income Audit</h3>
                    <p className="text-xs text-neutral-500">Source: Chase Bank (Direct Payroll Feed)</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Plaid Verified</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                  <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-xs text-neutral-400 font-medium">Estimated Monthly Income</p>
                    <p className="text-2xl font-extrabold text-neutral-900">$8,500.00 / mo</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-neutral-200">
                    <p className="text-xs text-neutral-400 font-medium">Rent-to-Income Ratio</p>
                    <p className="text-2xl font-extrabold text-emerald-600">3.2x Coverage</p>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "identity" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Government ID & Biometric Verification</h3>
                    <p className="text-xs text-neutral-500">Source: NY Driver License #****4912</p>
                  </div>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">SSN & ID Match</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Identity Match Confidence Score</span>
                  <span className="text-base font-extrabold text-blue-600">99.8% Match</span>
                </div>
              </div>
            )}

            {activeDemoTab === "rental" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Verified Prior Landlord Ledger</h3>
                    <p className="text-xs text-neutral-500">Source: Stuytown Management Corp (2024–2026)</p>
                  </div>
                  <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">24 Mos Verified</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                  <p className="text-sm font-medium text-neutral-800">Payment History Rating: <span className="font-bold text-emerald-600">Flawless (Zero Late Fees)</span></p>
                </div>
              </div>
            )}

            {activeDemoTab === "credit" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Soft Credit Check (No Hard Inquiry)</h3>
                    <p className="text-xs text-neutral-500">Source: TransUnion Soft Check</p>
                  </div>
                  <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Score Range: Excellent</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                  <p className="text-sm font-medium text-neutral-800">Tenant Credit Tier: <span className="font-extrabold text-amber-600">760+ Tier 1 Approved</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Demo Interactive Action */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={triggerDemoVerify}
              disabled={isVerifyingDemo}
              className="flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 px-6 py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
            >
              {isVerifyingDemo ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Encrypted Audit…
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 text-[#FF385C]" />
                  Simulate Live Verification
                </>
              )}
            </button>

            {demoVerified && (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 animate-in fade-in zoom-in-95">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                MiddleMan Document Verified & Encrypted!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (DUAL ROLE TAB) */}
      <section id="how-it-works" className="py-20 bg-white border-y border-neutral-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
              How MiddleMan Works
            </h2>
            <p className="text-neutral-600 text-base mt-2">
              Simple, transparent, and instant for both sides of the lease.
            </p>

            {/* Role Switcher */}
            <div className="inline-flex p-1.5 rounded-full bg-neutral-100 border border-neutral-200 mt-6">
              <button
                onClick={() => setActiveUserRole("tenant")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeUserRole === "tenant" ? "bg-[#FF385C] text-white shadow-md shadow-[#FF385C]/20" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                For Tenants
              </button>
              <button
                onClick={() => setActiveUserRole("landlord")}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeUserRole === "landlord" ? "bg-[#FF385C] text-white shadow-md shadow-[#FF385C]/20" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                For Landlords
              </button>
            </div>
          </div>

          {/* Workflow Cards */}
          {activeUserRole === "tenant" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 airbnb-shadow-hover">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[#FF385C] font-extrabold text-lg flex items-center justify-center mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Connect Your Bank</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Log in with Plaid in 30 seconds. No printing paystubs, masking SSNs, or emailing sensitive PDFs.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 airbnb-shadow-hover">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[#FF385C] font-extrabold text-lg flex items-center justify-center mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Get Your Verification Passport</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  MiddleMan generates a tamper-proof verification link showing verified income coverage and rental readiness.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 airbnb-shadow-hover">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[#FF385C] font-extrabold text-lg flex items-center justify-center mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Apply with 1 Click</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Share your MiddleMan badge with any landlord or property manager to bypass application fees and speed up approval.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 airbnb-shadow-hover">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">List Your Property</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Add your rental listings on your MiddleMan Landlord Dashboard with custom income threshold requirements.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 airbnb-shadow-hover">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Receive Verified Applicants</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Applicants submit direct-verified bank income proofs. Say goodbye to photoshopped W-2s and fake landlord references.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 airbnb-shadow-hover">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Approve & Sign</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Review complete document audit histories and sign leases faster with 100% confidence in tenant financial standing.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Verified Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-3">
            Trusted by Thousands Across New York & Beyond
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl bg-white p-8 border border-neutral-200 airbnb-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed italic">
                &ldquo;MiddleMan saved me from dealing with fake paystubs. I verified my income through my bank account in 45 seconds and got approved for my Soho loft the next morning.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Sarah"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Sarah Jenkins</p>
                <p className="text-xs text-neutral-500">Tenant, West Village</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-neutral-200 airbnb-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed italic">
                &ldquo;As a landlord managing 14 units in Brooklyn, fraudulent income verification was my biggest headache. MiddleMan gives me verified bank deposits directly. Essential tool.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Marcus"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Marcus Sterling</p>
                <p className="text-xs text-neutral-500">Property Manager, Brooklyn</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-neutral-200 airbnb-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed italic">
                &ldquo;The document passport concept is brilliant. I didn&apos;t have to keep re-uploading tax documents to 5 different broker applications.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                alt="Elena"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Elena Rostova</p>
                <p className="text-xs text-neutral-500">Tenant, Williamsburg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="py-20 bg-white border-t border-neutral-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-neutral-900">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600 text-sm mt-2">
              Everything you need to know about MiddleMan document security.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-neutral-900 text-base"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF385C]" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-4 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-[#1c1c1c] text-white p-10 sm:p-16 relative overflow-hidden text-center flex flex-col items-center gap-6 airbnb-shadow">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF385C]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-rose-300 backdrop-blur-md border border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#FF385C]" />
            Join MiddleMan Today
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
            Ready for instant, fraud-proof document verification?
          </h2>

          <p className="text-neutral-400 text-base max-w-xl">
            Whether you&apos;re a tenant looking to stand out or a landlord protecting your investments, MiddleMan makes lease verification seamless.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/signup"
              className="rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#FF385C]/30 transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all"
            >
              Log in to Existing Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
