import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router

app = FastAPI(
    title="Legal Metrology Inspection Intelligence API",
    description="Compliance & Inspection Platform for Packaged Commodities under Legal Metrology Act 2009 & PCR 2011",
    version="1.0.4",
)

# Parse allowed origins from environment variable or default to local dev origins
raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
