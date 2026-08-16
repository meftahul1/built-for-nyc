"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  useProperties,
  Property,
  TenantCriteria,
  DEFAULT_CRITERIA,
  Application,
} from "@/context/PropertyContext";
import { buildApplicantChecklist, summarizeChecklist, ChecklistStatus } from "@/lib/checklist";
import { TenantCriteriaFields } from "@/components/TenantCriteriaFields";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import {
  Building2,
  Plus,
  Trash2,
  ShieldCheck,
  Bed,
  Bath,
  MapPin,
  X,
  Sparkles,
  ExternalLink,
  Home as HomeIcon,
  UserCheck,
  ClipboardList,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock3,
  SlidersHorizontal,
} from "lucide-react";

function StatusPill({ status }: { status: ChecklistStatus }) {
  if (status === "pass")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Meets
      </span>
    );
  if (status === "fail")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
        <XCircle className="h-3.5 w-3.5" /> Below
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
      <Clock3 className="h-3.5 w-3.5" /> Pending
    </span>
  );
}

function ApplicationStatusBadge({ status }: { status: Application["status"] }) {
  const styles: Record<Application["status"], string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rejected: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function LandlordPortal() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const {
    properties,
    addProperty,
    deleteProperty,
    updatePropertyCriteria,
    tenants,
    applications,
    approveApplication,
    rejectApplication,
  } = useProperties();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/landlord/login");
      return;
    }
    if (role !== "landlord") {
      router.replace("/tenant-dashboard");
    }
  }, [authLoading, user, role, router]);

  const [activeTab, setActiveTab] = useState<"properties" | "applicants">("properties");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [criteriaEditPropertyId, setCriteriaEditPropertyId] = useState<string | null>(null);
  const [criteriaDraft, setCriteriaDraft] = useState<TenantCriteria>(DEFAULT_CRITERIA);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);
  const [applicantFilter, setApplicantFilter] = useState<"all" | Application["status"]>("all");

  // Add Property form state
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
  const [newCriteria, setNewCriteria] = useState<TenantCriteria>(DEFAULT_CRITERIA);

  const landlordProperties = properties.filter((p) => p.isLandlordProperty);
  const landlordPropertyIds = useMemo(() => new Set(landlordProperties.map((p) => p.id)), [landlordProperties]);
  const landlordApplications = applications.filter((a) => landlordPropertyIds.has(a.propertyId));
  const visibleApplications =
    applicantFilter === "all" ? landlordApplications : landlordApplications.filter((a) => a.status === applicantFilter);
  const pendingCount = landlordApplications.filter((a) => a.status === "pending").length;

  const propertyById = (id: string) => properties.find((p) => p.id === id);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProperty(
      {
        title: title || "New Verified Residence",
        address: address || "150 Greene St",
        city: city || "New York",
        state: state || "NY",
        price: price || 3500,
        bedrooms: bedrooms || 2,
        bathrooms: bathrooms || 2,
        sqft: sqft || 1000,
        description: description || "Modern rental unit with verified applicant screening.",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      },
      newCriteria
    );
    setTitle("");
    setAddress("");
    setDescription("");
    setImageUrl("");
    setNewCriteria(DEFAULT_CRITERIA);
    setIsAddModalOpen(false);
  };

  const openCriteriaEditor = (property: Property) => {
    setCriteriaEditPropertyId(property.id);
    setCriteriaDraft(property.criteria);
  };

  const saveCriteriaEdit = () => {
    if (criteriaEditPropertyId) updatePropertyCriteria(criteriaEditPropertyId, criteriaDraft);
    setCriteriaEditPropertyId(null);
  };

  if (authLoading || !user || role !== "landlord") {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-50 text-sm font-semibold text-neutral-500">
        Loading landlord portal…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans pb-24">
      {/* Top Dashboard Header */}
      <section className="bg-white border-b border-neutral-200/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 border border-blue-200 mb-2">
              <Building2 className="h-4 w-4" />
              Landlord Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Property Portfolio & Applicants
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Manage your listings, set tenant requirements, and review applicant checklists.
            </p>
          </div>

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
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
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
            <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <HomeIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Listed Properties</p>
              <p className="text-3xl font-extrabold text-neutral-900 mt-0.5">{landlordProperties.length}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock3 className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pending Review</p>
              <p className="text-3xl font-extrabold text-neutral-900 mt-0.5">{pendingCount}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 airbnb-shadow flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Applicants</p>
              <p className="text-3xl font-extrabold text-neutral-900 mt-0.5">{landlordApplications.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
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
                activeTab === "applicants" ? "bg-blue-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Applicants ({landlordApplications.length})
            </button>
          </div>
        </div>

        {/* TAB 1: PROPERTIES */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {landlordProperties.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-extrabold text-neutral-900">No properties added yet</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    List your first rental unit and set the tenant requirements applicants must meet.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform mt-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {landlordProperties.map((property) => {
                  const propApplications = applications.filter((a) => a.propertyId === property.id);
                  const requirementCount = [
                    property.criteria.requireIdentityVerification,
                    property.criteria.requireIncomeVerification,
                    property.criteria.requireBackgroundCheck,
                  ].filter(Boolean).length;
                  return (
                    <div
                      key={property.id}
                      className="rounded-3xl border border-neutral-200 bg-white p-5 airbnb-shadow flex flex-col gap-4"
                    >
                      <div className="flex gap-5 items-start">
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          className="h-32 w-32 rounded-2xl object-cover border border-neutral-100 flex-shrink-0"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                            </span>
                            <span className="font-extrabold text-neutral-900 text-base">
                              ${property.price.toLocaleString()}/mo
                            </span>
                          </div>
                          <h3 className="font-extrabold text-neutral-900 text-base leading-snug">{property.title}</h3>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                            {property.address}, {property.city}
                          </p>
                          <div className="flex items-center gap-3 text-xs font-bold text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Bed className="h-3.5 w-3.5 text-neutral-400" /> {property.bedrooms} Bed
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-3.5 w-3.5 text-neutral-400" /> {property.bathrooms} Bath
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl bg-neutral-50 border border-neutral-200/80 px-4 py-2.5">
                        <div className="text-xs font-semibold text-neutral-600">
                          {requirementCount} verification requirement{requirementCount === 1 ? "" : "s"} ·{" "}
                          {property.criteria.minIncomeMultiplier}× rent income · {property.criteria.minCreditScore}+ credit
                        </div>
                        <div className="text-xs font-bold text-neutral-500">{propApplications.length} applicant{propApplications.length === 1 ? "" : "s"}</div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                        <button
                          onClick={() => openCriteriaEditor(property)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors mt-3"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Tenant Requirements
                        </button>
                        <button
                          onClick={() => deleteProperty(property.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors mt-3"
                          title="Delete Property"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICANTS */}
        {activeTab === "applicants" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-950">
                <ClipboardList className="h-4 w-4 text-blue-600" />
                Verification Checklist, Not Raw Financials
              </p>
              <p className="text-blue-800 leading-relaxed">
                Each applicant is screened against your listing&apos;s requirements. Income and identity are confirmed
                directly through Plaid and MiddleMan — you see pass/fail results, not bank statements or account numbers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setApplicantFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    applicantFilter === f ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {visibleApplications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center text-sm text-neutral-500">
                No applicants in this view yet.
              </div>
            ) : (
              <div className="space-y-4">
                {visibleApplications.map((application) => {
                  const tenant = tenants[application.tenantId];
                  const property = propertyById(application.propertyId);
                  if (!tenant || !property) return null;
                  const checklist = buildApplicantChecklist(tenant, property.criteria, property.price);
                  const summary = summarizeChecklist(checklist);
                  const isExpanded = expandedApplicationId === application.id;

                  return (
                    <div key={application.id} className="rounded-3xl border border-neutral-200 bg-white airbnb-shadow overflow-hidden">
                      <button
                        onClick={() => setExpandedApplicationId(isExpanded ? null : application.id)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <InitialsAvatar name={tenant.name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-neutral-900 text-sm truncate">{tenant.name}</h3>
                              <ApplicationStatusBadge status={application.status} />
                            </div>
                            <p className="text-xs text-neutral-500 truncate">
                              Applied to <span className="font-semibold text-neutral-700">{property.title}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                              summary.overall === "meets"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : summary.overall === "does-not-meet"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {summary.passed}/{summary.total} Requirements Met
                          </span>
                          <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-4 border-t border-neutral-100 pt-4 animate-in fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {checklist.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 border border-neutral-200/80 px-3.5 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-neutral-800">{item.label}</p>
                                  <p className="text-[11px] text-neutral-500 truncate">{item.detail}</p>
                                </div>
                                <StatusPill status={item.status} />
                              </div>
                            ))}
                          </div>

                          {application.status === "pending" && (
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={() => approveApplication(application.id)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve Applicant
                              </button>
                              <button
                                onClick={() => rejectApplication(application.id)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ADD PROPERTY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 airbnb-shadow max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 my-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-neutral-900">Add New Rental Property</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Publish a listing and set the requirements applicants must meet.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="space-y-4">
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
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                      className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                      className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                      className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                      className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                      className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
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
                    className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-5">
                <h3 className="text-sm font-extrabold text-neutral-900 mb-3">Tenant Requirements</h3>
                <TenantCriteriaFields value={newCriteria} onChange={setNewCriteria} />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Publish Property
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TENANT REQUIREMENTS MODAL */}
      {criteriaEditPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 airbnb-shadow max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 my-auto">
            <button
              onClick={() => setCriteriaEditPropertyId(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Tenant Requirements
              </h2>
              <p className="text-xs text-neutral-500 mt-1">{propertyById(criteriaEditPropertyId)?.title}</p>
            </div>
            <TenantCriteriaFields value={criteriaDraft} onChange={setCriteriaDraft} />
            <button
              onClick={saveCriteriaEdit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Save Requirements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
