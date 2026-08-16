import re

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user
from app.core.supabase_client import get_supabase_admin_client
from app.schemas.properties import CriteriaUpdate, PropertyCreate, PropertyOut

router = APIRouter(prefix="/properties", tags=["properties"])


def _display_name_from_email(email: str | None) -> str:
    if not email:
        return "Landlord"
    local = email.split("@")[0]
    parts = [p for p in re.split(r"[._-]+", local) if p]
    return " ".join(p.capitalize() for p in parts) or "Landlord"


def _row_to_out(row: dict) -> PropertyOut:
    return PropertyOut(
        id=row["id"],
        landlordId=row["landlord_id"],
        title=row["title"],
        address=row["address"],
        city=row["city"],
        state=row["state"],
        price=row["rent_amount"],
        bedrooms=row["bedrooms"],
        bathrooms=row["bathrooms"],
        sqft=row["sqft"],
        description=row["description"],
        imageUrl=row["image_url"],
        landlordName=row["landlord_name"],
        landlordAvatar=row["landlord_avatar"],
        landlordRating=row["landlord_rating"],
        landlordResponseTime=row["landlord_response_time"],
        verifiedStatus=row["verified_status"],
        verifiedFeatures=row["verified_features"] or [],
        criteria=row["criteria"],
        createdAt=row["created_at"],
    )


@router.get("", response_model=list[PropertyOut])
def list_properties() -> list[PropertyOut]:
    """Public marketplace listing — every property from every landlord.
    No auth required; this is what the tenant-facing /properties page reads."""
    db = get_supabase_admin_client()
    result = db.table("properties").select("*").order("created_at", desc=True).execute()
    return [_row_to_out(r) for r in result.data]


@router.post("", response_model=PropertyOut)
def create_property(body: PropertyCreate, user: dict = Depends(get_current_user)) -> PropertyOut:
    if user.get("user_metadata", {}).get("role") != "landlord":
        raise HTTPException(status_code=403, detail="Only landlord accounts can list properties.")

    db = get_supabase_admin_client()
    row = {
        "landlord_id": user["sub"],
        "title": body.title,
        "address": body.address,
        "city": body.city,
        "state": body.state,
        "rent_amount": body.price,
        "bedrooms": body.bedrooms,
        "bathrooms": body.bathrooms,
        "sqft": body.sqft,
        "description": body.description,
        "image_url": body.imageUrl,
        "landlord_name": _display_name_from_email(user.get("email")),
        "landlord_avatar": "",
        "landlord_rating": 5.0,
        "landlord_response_time": "Instant",
        "verified_status": "verified",
        "verified_features": ["Income Verified", "Plaid Bank Sync", "Owner Document Verified"],
        "criteria": body.criteria.model_dump(),
    }
    result = db.table("properties").insert(row).execute()
    return _row_to_out(result.data[0])


@router.patch("/{property_id}", response_model=PropertyOut)
def update_property_criteria(
    property_id: str, body: CriteriaUpdate, user: dict = Depends(get_current_user)
) -> PropertyOut:
    db = get_supabase_admin_client()
    existing = db.table("properties").select("landlord_id").eq("id", property_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Property not found.")
    if existing.data[0]["landlord_id"] != user["sub"]:
        raise HTTPException(status_code=403, detail="You don't own this property.")

    result = (
        db.table("properties")
        .update({"criteria": body.criteria.model_dump()})
        .eq("id", property_id)
        .execute()
    )
    return _row_to_out(result.data[0])


@router.delete("/{property_id}")
def delete_property(property_id: str, user: dict = Depends(get_current_user)) -> dict:
    db = get_supabase_admin_client()
    existing = db.table("properties").select("landlord_id").eq("id", property_id).limit(1).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Property not found.")
    if existing.data[0]["landlord_id"] != user["sub"]:
        raise HTTPException(status_code=403, detail="You don't own this property.")

    db.table("properties").delete().eq("id", property_id).execute()
    return {"status": "deleted"}
