import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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
