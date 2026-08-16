from typing import Literal

from pydantic import BaseModel

Role = Literal["tenant", "landlord"]


class SignupRequest(BaseModel):
    email: str
    password: str
    role: Role


class SignupResponse(BaseModel):
    id: str
    email: str | None
    role: Role
