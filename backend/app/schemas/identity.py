from datetime import datetime

from pydantic import BaseModel


class IdentitySessionRequest(BaseModel):
    return_url: str


class IdentitySessionResponse(BaseModel):
    url: str
    session_id: str
    status: str


class IdentityStatusResponse(BaseModel):
    status: str  # not_started | requires_input | processing | verified | canceled
    session_id: str | None
    last_error_reason: str | None
    verified_at: datetime | None
    created_at: datetime | None


class WebhookAck(BaseModel):
    received: bool
