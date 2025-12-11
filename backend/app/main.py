from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, hospital, services, capacity, location, equipment
# Google Sheets désactivé
# from app.api.v1 import auth_sheets
# from app.hospitals_routes import router as hospitals_router
from app.core.config import settings
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(
    title="PulseAI Hospital Dashboard API",
    version="1.0.0",
    description="API Backend pour le Dashboard PulseAI"
)

# CORS - Autoriser le frontend
# Configuration CORS plus permissive pour le développement et la production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://pulseai-dashboard.vercel.app",
        "https://frontend-5t5n42vm1-light667s-projects.vercel.app",
        # Firebase Hosting domains (Flutter Web)
        "https://pulseai.web.app",
        "https://pulseai.firebaseapp.com",
        "https://pulseai-a0548.web.app",
        "https://pulseai-a0548.firebaseapp.com",
    ],
    # Allow Vercel subdomains and Firebase Hosting subdomains
    allow_origin_regex="https://.*\\.vercel\\.app|https://.*\\.web\\.app|https://.*\\.firebaseapp\\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
def root():
    return {
        "message": "PulseAI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/v1")
def api_info():
    return {
        "message": "PulseAI API v1",
        "endpoints": [
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/hospital/me",
            "/api/v1/hospital/dashboard",
            "/api/v1/services/",
            "/api/v1/capacity/",
            "/api/v1/location/",
            "/api/v1/equipment/"
        ]
    }

# Inclure les routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# Google Sheets désactivé - pas de credentials
# app.include_router(auth_sheets.router, tags=["Authentication (Google Sheets)"])
app.include_router(hospital.router, prefix="/api/v1/hospital", tags=["Hospital"])
app.include_router(services.router, prefix="/api/v1/services", tags=["Services"])
app.include_router(capacity.router, prefix="/api/v1/capacity", tags=["Capacity"])
app.include_router(location.router, prefix="/api/v1/location", tags=["Location"])
app.include_router(equipment.router, prefix="/api/v1/equipment", tags=["Equipment"])

# Nouveau: Routes Google Sheets pour les hôpitaux - désactivé
# app.include_router(hospitals_router, tags=["Hospitals (Google Sheets)"])
