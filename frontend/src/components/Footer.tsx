import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF385C] to-[#E00B41] text-white">
                <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">
                MiddleMan
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-600">
              The trusted verification bridge connecting tenants and landlords. Verify income, background, and rental history with instant, bank-level encryption.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                256-Bit Encrypted
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">
                <Lock className="h-3.5 w-3.5 text-neutral-500" />
                SOC2 Type II Ready
              </div>
            </div>
          </div>

          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              For Tenants
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-600">
              <li>
                <Link href="/properties" className="hover:text-neutral-900 transition-colors">
                  Browse Verified Homes
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-neutral-900 transition-colors">
                  Instant Income Verification
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-neutral-900 transition-colors">
                  Create Tenant Passport
                </Link>
              </li>
              <li>
                <Link href="/#trust-security" className="hover:text-neutral-900 transition-colors">
                  Data Privacy Guarantee
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              For Landlords
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-600">
              <li>
                <Link href="/landlord/login" className="hover:text-neutral-900 transition-colors font-medium text-[#FF385C]">
                  Landlord Portal
                </Link>
              </li>
              <li>
                <Link href="/landlord/signup" className="hover:text-neutral-900 transition-colors">
                  Post a Property
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-neutral-900 transition-colors">
                  Automated Income Audit
                </Link>
              </li>
              <li>
                <Link href="/#trust-security" className="hover:text-neutral-900 transition-colors">
                  Fraud Prevention
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Company & Trust
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-600">
              <li>
                <Link href="/#trust-security" className="hover:text-neutral-900 transition-colors">
                  Security Standards
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-neutral-900 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-neutral-900 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-neutral-400">Terms & Privacy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-200/80 pt-8 sm:flex-row text-xs text-neutral-500">
          <p>© 2026 MiddleMan Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted for trust & document verification with <Heart className="h-3.5 w-3.5 fill-[#FF385C] text-[#FF385C]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
