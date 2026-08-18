from datetime import datetime

from pydantic import BaseModel


class ApplyRequest(BaseModel):
    propertyId: str


class ApplicationStatusUpdate(BaseModel):
    status: str  # "approved" | "rejected"


class ApplicationOut(BaseModel):
    id: str
    propertyId: str
    tenantId: str
    status: str  # pending | approved | rejected
    appliedAt: datetime


class TenantProfileOut(BaseModel):
    id: str
    name: str
    email: str
    identityStatus: str  # verified | pending | unverified
    identityDetails: str
    monthlyVerifiedIncome: float
    annualVerifiedIncome: float
    creditScore: int
    creditTier: str
    creditUtilization: float


class LandlordApplicationsResponse(BaseModel):
    applications: list[ApplicationOut]
    tenants: dict[str, TenantProfileOut]
