from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health, plaid
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Tenant Income Verification API", version="0.1.0")

# @app.get("/")
# def root():
#     return {"message": "Welcome to the Backend API!"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(plaid.router, prefix=settings.api_v1_prefix)
