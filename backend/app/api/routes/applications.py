import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.core.deps import get_current_user
from app.core.supabase_client import get_supabase_admin_client
from app.schemas.applications import (
    ApplicationOut,
    ApplicationStatusUpdate,
    ApplyRequest,
    LandlordApplicationsResponse,
    TenantProfileOut,
)

router = APIRouter(prefix="/applications", tags=["applications"])

# rental_applications.status is a pre-existing enum (draft | submitted |
# under_review | approved | declined | withdrawn); the frontend only knows
# about pending | approved | rejected, so we collapse it on the way out and
# expand it on the way in.
_REJECTED_DB_STATUS = "declined"
_APPROVED_DB_STATUS = "approved"


def _display_name_from_email(email: str | None) -> str:
    if not email:
        return "Tenant"
    local = email.split("@")[0]
    parts = [p for p in re.split(r"[._-]+", local) if p]
    return " ".join(p.capitalize() for p in parts) or "Tenant"


def _map_status(db_status: str) -> str:
    if db_status == _APPROVED_DB_STATUS:
        return "approved"
    if db_status in ("declined", "withdrawn"):
        return "rejected"
    return "pending"  # draft | submitted | under_review


def _row_to_out(row: dict) -> ApplicationOut:
    return ApplicationOut(
        id=row["id"],
        propertyId=row["property_id"],
        tenantId=row["tenant_id"],
        status=_map_status(row["status"]),
        appliedAt=row.get("submitted_at") or row["created_at"],
    )


def _build_tenant_profile(db: Client, tenant_id: str) -> TenantProfileOut:
    profile_res = db.table("profiles").select("full_name, email").eq("id", tenant_id).limit(1).execute()
    profile = profile_res.data[0] if profile_res.data else {}
    email = profile.get("email") or ""
    name = profile.get("full_name") or _display_name_from_email(email)

    income_res = (
        db.table("income_verifications")
        .select("status, predicted_monthly_income")
        .eq("user_id", tenant_id)
        .order("requested_at", desc=True)
        .limit(1)
        .execute()
    )
    income_row = income_res.data[0] if income_res.data else None
    is_income_verified = bool(income_row and income_row["status"] == "success")
    monthly_income = float(income_row["predicted_monthly_income"] or 0) if is_income_verified else 0.0

    identity_res = (
        db.table("identity_verifications")
        .select("status")
        .eq("user_id", tenant_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    identity_db_status = identity_res.data[0]["status"] if identity_res.data else None
    if identity_db_status == "verified":
        identity_status, identity_details = "verified", "Stripe Identity — document verified"
    elif identity_db_status == "processing":
        identity_status, identity_details = "pending", "Stripe is reviewing your document"
    else:
        identity_status, identity_details = "unverified", "Not yet verified"

    return TenantProfileOut(
        id=tenant_id,
        name=name,
        email=email,
        identityStatus=identity_status,
        identityDetails=identity_details,
        monthlyVerifiedIncome=monthly_income,
        annualVerifiedIncome=monthly_income * 12,
        creditScore=0,
        creditTier="Not Available",
        creditUtilization=0,
    )


@router.post("", response_model=ApplicationOut)
def apply(body: ApplyRequest, user: dict = Depends(get_current_user)) -> ApplicationOut:
    if user.get("user_metadata", {}).get("role") != "tenant":
        raise HTTPException(status_code=403, detail="Only tenant accounts can apply to listings.")

    db = get_supabase_admin_client()
    existing = (
        db.table("rental_applications")
        .select("id")
        .eq("tenant_id", user["sub"])
        .eq("property_id", body.propertyId)
        .limit(1)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="You've already applied to this property.")

    row = {
        "tenant_id": user["sub"],
        "property_id": body.propertyId,
        "status": "submitted",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }
    result = db.table("rental_applications").insert(row).execute()
    return _row_to_out(result.data[0])


@router.get("/mine", response_model=list[ApplicationOut])
def my_applications(user: dict = Depends(get_current_user)) -> list[ApplicationOut]:
    db = get_supabase_admin_client()
    result = (
        db.table("rental_applications")
        .select("*")
        .eq("tenant_id", user["sub"])
        .order("created_at", desc=True)
        .execute()
    )
    return [_row_to_out(r) for r in result.data]


@router.get("/landlord", response_model=LandlordApplicationsResponse)
def landlord_applications(user: dict = Depends(get_current_user)) -> LandlordApplicationsResponse:
    if user.get("user_metadata", {}).get("role") != "landlord":
        raise HTTPException(status_code=403, detail="Only landlord accounts can view applicants.")

    db = get_supabase_admin_client()
    props_res = db.table("properties").select("id").eq("landlord_id", user["sub"]).execute()
    property_ids = [p["id"] for p in props_res.data]
    if not property_ids:
        return LandlordApplicationsResponse(applications=[], tenants={})

    apps_res = (
        db.table("rental_applications")
        .select("*")
        .in_("property_id", property_ids)
        .order("created_at", desc=True)
        .execute()
    )
    applications = [_row_to_out(r) for r in apps_res.data]
    tenant_ids = sorted({a.tenantId for a in applications})
    tenants = {tenant_id: _build_tenant_profile(db, tenant_id) for tenant_id in tenant_ids}
    return LandlordApplicationsResponse(applications=applications, tenants=tenants)


@router.patch("/{application_id}", response_model=ApplicationOut)
def update_status(
    application_id: str, body: ApplicationStatusUpdate, user: dict = Depends(get_current_user)
) -> ApplicationOut:
    if body.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="status must be 'approved' or 'rejected'.")

    db = get_supabase_admin_client()
    existing = (
        db.table("rental_applications")
        .select("*, properties(landlord_id)")
        .eq("id", application_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Application not found.")
    row = existing.data[0]
    if not row.get("properties") or row["properties"]["landlord_id"] != user["sub"]:
        raise HTTPException(status_code=403, detail="You don't own this property.")

    db_status = _APPROVED_DB_STATUS if body.status == "approved" else _REJECTED_DB_STATUS
    result = db.table("rental_applications").update({"status": db_status}).eq("id", application_id).execute()
    return _row_to_out(result.data[0])
