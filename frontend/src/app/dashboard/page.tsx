"use client";

import { useState } from "react";
import Link from "next/link";
import { useProperties, Property } from "@/context/PropertyContext";
import {
  Building2,
  Plus,
  Trash2,
  ShieldCheck,
  BadgeCheck,
  Bed,
  Bath,
  MapPin,
  X,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Home as HomeIcon,
  Eye,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function LandlordDashboard() {
  const { properties, addProperty, deleteProperty, tenants, hasAppliedToLandlord } = useProperties();
  const [activeTab, setActiveTab] = useState<"properties" | "applicants">("properties");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("New York");
  const [state, setState] = useState("NY");
  const [price, setPrice] = useState<number>(3800);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [sqft, setSqft] = useState<number>(1050);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Filter properties scoped to landlord view
  const landlordProperties = properties.filter((p) => p.isLandlordProperty);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProperty({
      title: title || "New Verified Residence",
      address: address || "150 Greene St",
      city: city || "New York",
      state: state || "NY",
      price: price || 3500,
      bedrooms: bedrooms || 2,
      bathrooms: bathrooms || 2,
      sqft: sqft || 1000,
      description: description || "Modern luxury property with verified income and instant document verification support.",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    });

    // Reset Form & Close Modal
    setTitle("");
    setAddress("");
    setDescription("");
    setImageUrl("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans pb-24">
      {/* Top Dashboard Header */}
      <section className="bg-white border-b border-neutral-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-[#FF385C] border border-rose-200 mb-2">
              <Building2 className="h-4 w-4" />
              Landlord Management Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Property Portfolio & Applicants
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Manage your rental listings and review verified tenant income passports.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-colors shadow-sm"
            >
              <ExternalLink className="h-4 w-4 text-neutral-500" />
              View Public Listings
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Property
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#FF385C]">
              <HomeIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Listed Properties</p>
              <p className="text-3xl font-extrabold text-neutral-900 mt-0.5">{landlordProperties.length}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Verified Applicants</p>
              <p className="text-3xl font-extrabold text-neutral-900 mt-0.5">2 Applied</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Verification Rate</p>
              <p className="text-3xl font-extrabold text-neutral-900 mt-0.5">100% Plaid</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Properties vs Applicants */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200">
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "properties" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Your Properties ({landlordProperties.length})
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "applicants" ? "bg-[#FF385C] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Applicants & Passports (2)
            </button>
          </div>
        </div>

        {/* TAB 1: PROPERTIES LIST */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {landlordProperties.length === 0 ? (
              /* Polished Empty State */
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-extrabold text-neutral-900">No properties added yet</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    You haven&apos;t listed any properties under your landlord account. Click below to post your first unit.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-6 py-3 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {landlordProperties.map((property) => (
                  <div
                    key={property.id}
                    className="rounded-3xl border border-neutral-200 bg-white p-5 airbnb-shadow flex flex-col sm:flex-row gap-5 items-start justify-between"
                  >
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="h-32 w-full sm:w-36 rounded-2xl object-cover border border-neutral-100 flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified Active
                          </span>
                          <span className="font-extrabold text-neutral-900 text-base">
                            ${property.price.toLocaleString()}/mo
                          </span>
                        </div>
                        <h3 className="font-extrabold text-neutral-900 text-base mt-1.5 leading-snug">
                          {property.title}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          {property.address}, {property.city}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs font-bold text-neutral-600">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Bed className="h-3.5 w-3.5 text-neutral-400" /> {property.bedrooms} Bed
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="h-3.5 w-3.5 text-neutral-400" /> {property.bathrooms} Bath
                          </span>
                        </div>

                        <button
                          onClick={() => deleteProperty(property.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                          title="Delete Property"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICANTS & ACCESS CONTROL DASHBOARD */}
        {activeTab === "applicants" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Landlord Access Control Gating (In-Memory Simulation)
              </p>
              <p className="text-blue-800 leading-relaxed">
                As a landlord, you can view the full Plaid verification passport for tenants who have applied to your listings. If a tenant has not applied, access is restricted.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Applicant 1: Alex Rivera (Applied) */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Applied & Shared
                  </span>
                  <span className="text-xs font-bold text-emerald-600">$9,450/mo Verified</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={tenants["tenant-me"]?.avatar}
                    alt="Alex"
                    className="h-12 w-12 rounded-full object-cover border border-rose-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-sm">{tenants["tenant-me"]?.name}</h3>
                    <p className="text-xs text-neutral-500">Applied for Soho Loft</p>
                  </div>
                </div>

                <Link
                  href="/tenant-dashboard?tenantId=tenant-me&asLandlord=true"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-3 text-xs font-bold text-white shadow-md hover:scale-[1.02] transition-transform"
                >
                  <Eye className="h-4 w-4" />
                  Inspect Verified Passport
                </Link>
              </div>

              {/* Applicant 2: Jordan Vance (Applied) */}
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Applied & Shared
                  </span>
                  <span className="text-xs font-bold text-emerald-600">$11,200/mo Verified</span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={tenants["tenant-#002"]?.avatar}
                    alt="Jordan"
                    className="h-12 w-12 rounded-full object-cover border border-rose-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-sm">{tenants["tenant-#002"]?.name}</h3>
                    <p className="text-xs text-neutral-500">Applied for Soho Loft</p>
                  </div>
                </div>

                <Link
                  href="/tenant-dashboard?tenantId=tenant-%23002&asLandlord=true"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-3 text-xs font-bold text-white shadow-md hover:scale-[1.02] transition-transform"
                >
                  <Eye className="h-4 w-4" />
                  Inspect Verified Passport
                </Link>
              </div>

              {/* Applicant 3: Unapplied Tenant (Test Access Control Gating) */}
              <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 airbnb-shadow flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <Lock className="h-3.5 w-3.5 text-[#FF385C]" /> Access Restricted
                  </span>
                  <span className="text-xs font-bold text-neutral-400">Not Applied</span>
                </div>

                <div className="flex items-center gap-3 opacity-60">
                  <img
                    src={tenants["tenant-unapplied"]?.avatar}
                    alt="Unapplied"
                    className="h-12 w-12 rounded-full object-cover border border-neutral-300 grayscale"
                  />
                  <div>
                    <h3 className="font-bold text-neutral-700 text-sm">{tenants["tenant-unapplied"]?.name}</h3>
                    <p className="text-xs text-neutral-500">No active applications</p>
                  </div>
                </div>

                <Link
                  href="/tenant-dashboard?tenantId=tenant-unapplied&asLandlord=true"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-white py-3 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <Lock className="h-4 w-4 text-[#FF385C]" />
                  Test Access Lock (Unapplied Tenant)
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD PROPERTY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 airbnb-shadow max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 my-auto">
            {/* Close button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-neutral-900">Add New Rental Property</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Fill in the details to publish a new verified listing to MiddleMan tenants.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Penthouse Loft in Soho"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 185 Wooster St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Monthly Rent ($)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(Number(e.target.value))}
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Image URL (Unsplash or Direct Link)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe building amenities, light, neighborhood features…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-[#FF385C] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-4 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:-translate-y-0.5 pt-3"
              >
                <Plus className="h-5 w-5" />
                Publish Property to MiddleMan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
