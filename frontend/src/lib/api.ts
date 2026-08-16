const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `${path} failed (${res.status})`);
  }
  return res.json();
}

export type LinkTokenResponse = { link_token: string; expiration: string };

export type BalanceSnapshot = {
  account_id: string;
  account_name: string | null;
  account_subtype: string | null;
  available_balance: number | null;
  current_balance: number | null;
  iso_currency_code: string | null;
};

export type IncomeStream = {
  income_source_id: string;
  description: string | null;
  category: string | null;
  pay_frequency: string | null;
  total_amount: number;
  monthly_amount: number;
};

export type IncomeVerification = {
  status: "pending" | "processing" | "success" | "failed";
  predicted_monthly_income: number | null;
  total_amount: number | null;
  income_streams: IncomeStream[];
  error_message: string | null;
};

export type VerifyResponse = { balances: BalanceSnapshot[]; income: IncomeVerification };

export type PlaidItem = {
  id: string;
  institution_name: string | null;
  status: string;
  created_at: string;
};

export type VerifyStatusResponse = {
  item: PlaidItem | null;
  balances: BalanceSnapshot[];
  income: IncomeVerification | null;
};

export function createLinkToken(accessToken: string) {
  return request<LinkTokenResponse>("/plaid/link-token", accessToken, { method: "POST" });
}

export function exchangePublicToken(
  accessToken: string,
  body: { public_token: string; institution_id: string | null; institution_name: string | null }
) {
  return request<{ item: unknown }>("/plaid/exchange-token", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function runVerification(accessToken: string) {
  return request<VerifyResponse>("/plaid/verify", accessToken, { method: "POST" });
}

export function getVerificationStatus(accessToken: string) {
  return request<VerifyStatusResponse>("/plaid/verify/status", accessToken, { method: "GET" });
}

export type SignupRole = "tenant" | "landlord";

export type SignupResponse = { id: string; email: string | null; role: SignupRole };

export async function signupUser(email: string, password: string, role: SignupRole) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `/auth/signup failed (${res.status})`);
  }
  return res.json() as Promise<SignupResponse>;
}

export type TenantCriteriaDto = {
  minIncomeMultiplier: number;
  minCreditScore: number;
  requireIncomeVerification: boolean;
  requireIdentityVerification: boolean;
  requireBackgroundCheck: boolean;
  petsAllowed: boolean;
  notes: string;
};

export type PropertyRecord = {
  id: string;
  landlordId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  imageUrl: string;
  landlordName: string;
  landlordAvatar: string;
  landlordRating: number;
  landlordResponseTime: string;
  verifiedStatus: string;
  verifiedFeatures: string[];
  criteria: TenantCriteriaDto;
  createdAt: string;
};

export type PropertyCreateBody = {
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  imageUrl: string;
  criteria: TenantCriteriaDto;
};

export async function listProperties() {
  const res = await fetch(`${API_BASE_URL}/properties`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `/properties failed (${res.status})`);
  }
  return res.json() as Promise<PropertyRecord[]>;
}

export function createProperty(accessToken: string, body: PropertyCreateBody) {
  return request<PropertyRecord>("/properties", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePropertyCriteria(accessToken: string, propertyId: string, criteria: TenantCriteriaDto) {
  return request<PropertyRecord>(`/properties/${propertyId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ criteria }),
  });
}

export function deletePropertyRecord(accessToken: string, propertyId: string) {
  return request<{ status: string }>(`/properties/${propertyId}`, accessToken, { method: "DELETE" });
}
