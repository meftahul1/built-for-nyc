"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Building2, KeyRound, Sparkles, UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/properties", label: "Properties" },
    { href: "/tenant-dashboard", label: "My Passport", isTenant: true },
    { href: "/#how-it-works", label: "How it Works" },
    { href: "/#trust-security", label: "Trust & Security" },
    { href: "/dashboard", label: "Landlord Portal", isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF385C] to-[#E00B41] text-white shadow-md shadow-[#FF385C]/20 transition-all group-hover:shadow-lg group-hover:shadow-[#FF385C]/30">
            <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-neutral-900 font-sans flex items-center gap-1.5">
              MiddleMan
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-[#FF385C] ring-1 ring-inset ring-rose-200">
                Verified
              </span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/50 p-1.5 shadow-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-neutral-900 shadow-sm font-bold"
                    : link.isSpecial
                    ? "text-[#FF385C] hover:bg-rose-50/70 font-semibold"
                    : link.isTenant
                    ? "text-emerald-700 hover:bg-emerald-50/70 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                }`}
              >
                {link.isSpecial && <Building2 className="h-4 w-4 text-[#FF385C]" />}
                {link.isTenant && <UserCheck className="h-4 w-4 text-emerald-600" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden lg:inline text-xs font-semibold text-neutral-500 max-w-[160px] truncate">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 px-3.5 py-2 rounded-full hover:bg-neutral-100/80 transition-colors"
              >
                <LogOut className="h-4 w-4 text-neutral-400" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 px-3.5 py-2 rounded-full hover:bg-neutral-100/80 transition-colors"
              >
                <KeyRound className="h-4 w-4 text-neutral-400" />
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 rounded-full bg-[#FF385C] hover:bg-[#E00B41] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#FF385C]/25 transition-all hover:shadow-lg hover:shadow-[#FF385C]/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="h-4 w-4" />
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
