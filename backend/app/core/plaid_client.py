from functools import lru_cache

import plaid
from plaid.api.plaid_api import PlaidApi

from app.core.config import get_settings

_ENV_HOSTS = {
    "sandbox": plaid.Environment.Sandbox,
    "production": plaid.Environment.Production,
}


@lru_cache
def get_plaid_client() -> PlaidApi:
    """Server-side Plaid API client, credentialed from PLAID_CLIENT_ID / PLAID_SECRET.

    Never expose this client or the credentials it wraps to a frontend context.
    """
    settings = get_settings()
    configuration = plaid.Configuration(
        host=_ENV_HOSTS[settings.plaid_env],
        api_key={
            "clientId": settings.plaid_client_id,
            "secret": settings.plaid_secret,
        },
    )
    return PlaidApi(plaid.ApiClient(configuration))
