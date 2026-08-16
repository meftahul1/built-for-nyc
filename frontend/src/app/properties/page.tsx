"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProperties, Property } from "@/context/PropertyContext";
import { useAuth } from "@/context/AuthContext";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import {
  ShieldCheck,
  BadgeCheck,
  Search,
  SlidersHorizontal,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  X,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, propertiesLoading, applyToProperty, hasAppliedTo } = useProperties();
  const { user, role } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [minBedrooms, setMinBedrooms] = useState<number>(0);

  // Application Modal state
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Filter properties based on user controls
  const filteredProperties = properties.filter((p) => {
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.price <= maxPrice;
    const matchesBeds = minBedrooms === 0 || p.bedrooms >= minBedrooms;
    return matchesQuery && matchesPrice && matchesBeds;
  });

  const handleApplyVerification = () => {
    if (!selectedProperty) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (role !== "tenant") {
      setApplyError("Only tenant accounts can apply to listings.");
      return;
    }
    setApplyError(null);
    setIsApplying(true);
    setTimeout(() => {
      const result = applyToProperty(selectedProperty.id);
      setIsApplying(false);
      if (result.ok) {
        setAppliedSuccess(true);
      } else {
        setApplyError(result.message);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b border-neutral-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-[#FF385C] border border-rose-200 mb-2">
              <ShieldCheck className="h-4 w-4" />
              MiddleMan Verified Homes
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Browse Verified Rental Listings
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Every home listed here features direct MiddleMan landlord verification & instant income check.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search neighborhood or address…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 pl-10 pr-4 py-2.5 text-sm text-neutral-900 font-medium placeholder-neutral-400 focus:border-[#FF385C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Price Filter dropdown */}
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 text-sm font-semibold text-neutral-800 focus:border-[#FF385C] focus:outline-none"
            >
              <option value={3500}>Under $3,500/mo</option>
              <option value={4500}>Under $4,500/mo</option>
              <option value={6000}>Under $6,000/mo</option>
              <option value={10000}>All Prices</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-neutral-500">
            Showing <span className="text-neutral-900">{filteredProperties.length}</span> verified properties
          </p>
        </div>

        {propertiesLoading ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-16 text-center flex items-center justify-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading verified listings…
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-16 text-center text-sm text-neutral-500">
            No properties match yet. Check back soon, or adjust your filters.
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => {
                setSelectedProperty(property);
                setAppliedSuccess(false);
                setApplyError(null);
              }}
              className="group cursor-pointer rounded-3xl border border-neutral-200/90 bg-white overflow-hidden airbnb-shadow airbnb-shadow-hover flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-neutral-900 shadow-md">
                    <BadgeCheck className="h-4 w-4 text-[#FF385C]" />
                    MiddleMan Verified
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-900/80 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-white">
                    ${property.price.toLocaleString()}/mo
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-lg group-hover:text-[#FF385C] transition-colors leading-snug">
                      {property.title}
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      {property.address}, {property.city}
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 text-xs font-bold text-neutral-600 border-y border-neutral-100 py-3">
                  <span className="flex items-center gap-1.5">
                    <Bed className="h-4 w-4 text-neutral-400" />
                    {property.bedrooms} Bed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-neutral-400" />
                    {property.bathrooms} Bath
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4 text-neutral-400" />
                    {property.sqft} sqft
                  </span>
                </div>

                {/* Landlord Trust Badge */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    {property.landlordAvatar ? (
                      <img
                        src={property.landlordAvatar}
                        alt={property.landlordName}
                        className="h-7 w-7 rounded-full object-cover border border-neutral-200"
                      />
                    ) : (
                      <InitialsAvatar name={property.landlordName} className="h-7 w-7 text-[10px]" />
                    )}
                    <span className="font-semibold text-neutral-700">{property.landlordName}</span>
                  </div>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {property.landlordRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </main>

      {/* PROPERTY DETAIL MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 airbnb-shadow max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 my-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#FF385C] border border-rose-200">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Property Listing
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                  {selectedProperty.title}
                </h2>
                <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
                </p>
              </div>

              {/* Main Image Banner */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-neutral-100">
                <img
                  src={selectedProperty.imageUrl}
                  alt={selectedProperty.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-extrabold text-lg">
                  ${selectedProperty.price.toLocaleString()}<span className="text-xs font-normal text-neutral-300">/mo</span>
                </div>
              </div>

              {/* Features & Specs Bar */}
              <div className="grid grid-cols-3 gap-4 rounded-2xl bg-neutral-50 p-4 border border-neutral-200/80 text-center">
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase">Bedrooms</p>
                  <p className="text-lg font-extrabold text-neutral-900">{selectedProperty.bedrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase">Bathrooms</p>
                  <p className="text-lg font-extrabold text-neutral-900">{selectedProperty.bathrooms}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-bold uppercase">Square Feet</p>
                  <p className="text-lg font-extrabold text-neutral-900">{selectedProperty.sqft} sqft</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  About This Home
                </h4>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Verified Features Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  MiddleMan Trust & Verification Badges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProperty.verifiedFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 border border-emerald-200/60 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Landlord Card */}
              <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-4 bg-white mt-4">
                <div className="flex items-center gap-3">
                  {selectedProperty.landlordAvatar ? (
                    <img
                      src={selectedProperty.landlordAvatar}
                      alt={selectedProperty.landlordName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-rose-100"
                    />
                  ) : (
                    <InitialsAvatar name={selectedProperty.landlordName} className="h-12 w-12 text-sm border-2 border-rose-100" />
                  )}
                  <div>
                    <p className="font-extrabold text-neutral-900 text-sm">{selectedProperty.landlordName}</p>
                    <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {selectedProperty.landlordRating} Rating
                      </span>
                      •
                      <span className="flex items-center gap-1 text-neutral-500">
                        <Clock className="h-3 w-3" /> Responds {selectedProperty.landlordResponseTime}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Action CTA */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                {applyError && (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {applyError}
                  </div>
                )}
                {appliedSuccess || hasAppliedTo(selectedProperty.id) ? (
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm font-bold animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Verification Passport Submitted to Landlord!
                    </div>
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="text-xs bg-emerald-700 text-white px-4 py-2 rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleApplyVerification}
                    disabled={isApplying}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] py-4 text-base font-bold text-white shadow-lg shadow-[#FF385C]/25 transition-all hover:shadow-xl hover:shadow-[#FF385C]/35 disabled:opacity-50"
                  >
                    {isApplying ? (
                      <>
                        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transmitting Verified Passport…
                      </>
                    ) : !user ? (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Log In to Apply
                        <ArrowRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Apply with Instant MiddleMan Passport
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
