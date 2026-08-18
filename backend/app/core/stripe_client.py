import stripe

from app.core.config import get_settings


def get_stripe():
    """Server-side Stripe client, credentialed from STRIPE_SECRET_KEY.

    Never expose this key to a frontend context.
    """
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key
    return stripe
