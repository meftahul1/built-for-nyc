import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PropertyProvider } from "@/context/PropertyContext";
import { AuthProvider } from "@/context/AuthContext";
import { VerificationProvider } from "@/context/VerificationContext";
import { IdentityProvider } from "@/context/IdentityContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MiddleMan | Trusted Document Verification for Tenants & Landlords",
  description: "Verify tenant income, identity, and rental history securely with instant bank-grade encryption and Plaid integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans bg-neutral-50 text-neutral-900 selection:bg-rose-100 selection:text-[#FF385C]">
        {/*
          Preload Plaid Link once, app-wide, via Next's own dedup-safe script
          loader. react-plaid-link's usePlaidLink hook otherwise injects this
          same <script> itself inside a useEffect, and React Strict Mode's
          mount/cleanup/remount cycle in dev can race that injection and
          embed the script twice (the "embedded more than once" warning).
          usePlaidLink is called with checkForExisting: true by default, so
          once this tag is already present it reuses it instead of injecting
          its own copy — this URL must keep matching react-plaid-link's
          internal PLAID_LINK_STABLE_URL constant.
        */}
        <Script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" strategy="afterInteractive" />
        <AuthProvider>
          <VerificationProvider>
            <IdentityProvider>
              <PropertyProvider>
                <Navbar />
                <div className="flex-1">{children}</div>
                <Footer />
              </PropertyProvider>
            </IdentityProvider>
          </VerificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
