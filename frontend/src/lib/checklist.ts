import type { TenantCriteria, TenantProfile } from "@/context/PropertyContext";

export type ChecklistStatus = "pass" | "fail" | "pending";

export interface ChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
  detail: string;
}

export function buildApplicantChecklist(
  tenant: TenantProfile,
  criteria: TenantCriteria,
  monthlyRent: number
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (criteria.requireIdentityVerification) {
    items.push({
      id: "identity",
      label: "Identity Verified",
      status: tenant.identityStatus === "verified" ? "pass" : tenant.identityStatus === "pending" ? "pending" : "fail",
      detail:
        tenant.identityStatus === "verified"
          ? tenant.identityDetails || "Confirmed via MiddleMan"
          : tenant.identityStatus === "pending"
          ? "Verification in progress"
          : "Not yet verified",
    });
  }

  if (criteria.requireIncomeVerification) {
    const requiredIncome = Math.round(monthlyRent * criteria.minIncomeMultiplier);
    const hasIncome = tenant.monthlyVerifiedIncome > 0;
    const meets = tenant.monthlyVerifiedIncome >= requiredIncome;
    items.push({
      id: "income",
      label: `Income ≥ ${criteria.minIncomeMultiplier}× rent`,
      status: !hasIncome ? "pending" : meets ? "pass" : "fail",
      detail: hasIncome
        ? `Plaid-verified $${tenant.monthlyVerifiedIncome.toLocaleString()}/mo · requires $${requiredIncome.toLocaleString()}/mo`
        : "Bank income verification not yet completed",
    });
  }

  const hasCredit = tenant.creditScore > 0;
  items.push({
    id: "credit",
    label: `Credit score ≥ ${criteria.minCreditScore}`,
    status: !hasCredit ? "pending" : tenant.creditScore >= criteria.minCreditScore ? "pass" : "fail",
    detail: hasCredit ? `${tenant.creditScore} · ${tenant.creditTier}` : "Not yet available",
  });

  if (criteria.requireBackgroundCheck) {
    items.push({
      id: "background",
      label: "Clean rental & eviction history",
      status: tenant.identityStatus === "verified" ? "pass" : "pending",
      detail: tenant.identityStatus === "verified" ? "No eviction records found" : "Runs after identity verification",
    });
  }

  return items;
}

export function summarizeChecklist(items: ChecklistItem[]): {
  passed: number;
  total: number;
  overall: "meets" | "incomplete" | "does-not-meet";
} {
  const passed = items.filter((i) => i.status === "pass").length;
  const failed = items.filter((i) => i.status === "fail").length;
  const overall = failed > 0 ? "does-not-meet" : passed === items.length ? "meets" : "incomplete";
  return { passed, total: items.length, overall };
}
