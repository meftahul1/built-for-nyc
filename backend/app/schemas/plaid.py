from datetime import datetime

from pydantic import BaseModel


class LinkTokenResponse(BaseModel):
    link_token: str
    expiration: datetime


class ExchangeTokenRequest(BaseModel):
    public_token: str
    institution_id: str | None = None
    institution_name: str | None = None


class PlaidItemOut(BaseModel):
    id: str
    institution_name: str | None
    status: str
    created_at: datetime


class ExchangeTokenResponse(BaseModel):
    item: PlaidItemOut


class BalanceSnapshotOut(BaseModel):
    account_id: str
    account_name: str | None
    account_subtype: str | None
    available_balance: float | None
    current_balance: float | None
    iso_currency_code: str | None
    checked_at: datetime


class IncomeStreamOut(BaseModel):
    income_source_id: str
    description: str | None
    category: str | None
    pay_frequency: str | None
    total_amount: float
    monthly_amount: float


class IncomeVerificationOut(BaseModel):
    status: str
    predicted_monthly_income: float | None
    total_amount: float | None
    income_streams: list[IncomeStreamOut]
    error_message: str | None
    requested_at: datetime
    completed_at: datetime | None


class VerifyTriggerResponse(BaseModel):
    balances: list[BalanceSnapshotOut]
    income: IncomeVerificationOut


class VerifyStatusResponse(BaseModel):
    item: PlaidItemOut | None
    balances: list[BalanceSnapshotOut]
    income: IncomeVerificationOut | None


class WebhookAck(BaseModel):
    received: bool
