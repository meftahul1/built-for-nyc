"use client";

import type { TenantCriteria } from "@/context/PropertyContext";

interface TenantCriteriaFieldsProps {
  value: TenantCriteria;
  onChange: (next: TenantCriteria) => void;
}

export function TenantCriteriaFields({ value, onChange }: TenantCriteriaFieldsProps) {
  const set = <K extends keyof TenantCriteria>(key: K, val: TenantCriteria[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Min. Income Multiplier
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              step={0.5}
              value={value.minIncomeMultiplier}
              onChange={(e) => set("minIncomeMultiplier", Number(e.target.value))}
              className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">× rent</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Min. Credit Score
          </label>
          <input
            type="number"
            min={300}
            max={850}
            value={value.minCreditScore}
            onChange={(e) => set("minCreditScore", Number(e.target.value))}
            className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
          What tenants must verify to apply
        </label>
        <div className="space-y-2">
          {(
            [
              ["requireIdentityVerification", "Identity verification (government ID)"],
              ["requireIncomeVerification", "Bank-verified income (Plaid)"],
              ["requireBackgroundCheck", "Rental & eviction history check"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 cursor-pointer"
            >
              <span className="text-sm font-semibold text-neutral-800">{label}</span>
              <input
                type="checkbox"
                checked={value[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 cursor-pointer">
        <span className="text-sm font-semibold text-neutral-800">Pets allowed</span>
        <input
          type="checkbox"
          checked={value.petsAllowed}
          onChange={(e) => set("petsAllowed", e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
      </label>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
          Additional notes for applicants
        </label>
        <textarea
          rows={2}
          placeholder="e.g. No smoking, renters insurance required at move-in…"
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 focus:border-blue-500 focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  );
}
