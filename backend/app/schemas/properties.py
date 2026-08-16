from datetime import datetime

from pydantic import BaseModel


class TenantCriteria(BaseModel):
    minIncomeMultiplier: float
    minCreditScore: int
    requireIncomeVerification: bool
    requireIdentityVerification: bool
    requireBackgroundCheck: bool
    petsAllowed: bool
    notes: str = ""


class PropertyCreate(BaseModel):
    title: str
    address: str
    city: str
    state: str
    price: float
    bedrooms: int
    bathrooms: float
    sqft: int
    description: str = ""
    imageUrl: str = ""
    criteria: TenantCriteria


class CriteriaUpdate(BaseModel):
    criteria: TenantCriteria


class PropertyOut(BaseModel):
    id: str
    landlordId: str
    title: str
    address: str
    city: str
    state: str
    price: float
    bedrooms: int
    bathrooms: float
    sqft: int
    description: str
    imageUrl: str
    landlordName: str
    landlordAvatar: str
    landlordRating: float
    landlordResponseTime: str
    verifiedStatus: str
    verifiedFeatures: list[str]
    criteria: TenantCriteria
    createdAt: datetime
