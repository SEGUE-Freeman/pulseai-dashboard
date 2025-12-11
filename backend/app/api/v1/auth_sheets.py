"""
Routes d'authentification unifiées utilisant Google Sheets comme backend unique.
Ces routes remplacent les routes SQL pour une authentification sans base de données.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import os
import hashlib

from app.google_sheets_service import sheets_service
from app.core.config import settings

router = APIRouter(prefix="/api/v1/auth-sheets", tags=["Authentication (Google Sheets)"])
security = HTTPBearer()

# Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============= MODELS =============

class RegisterRequest(BaseModel):
    nom: str
    email: EmailStr
    password: str
    telephone: str
    adresse: str
    ville: str
    region: str
    pays: str = "Togo"
    latitude: float = 0.0
    longitude: float = 0.0
    description: str = ""
    type_etablissement: str = "Public"
    nombre_lits: int = 0
    horaires_ouverture: str = "24h/24"
    site_web: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    hospital_id: str
    nom: str
    email: str

# ============= FUNCTIONS =============

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie le mot de passe avec SHA256 (compatible avec hospitals_routes.py)"""
    password_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    return password_hash == hashed_password

# ============= ENDPOINTS =============

@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    """Inscription d'un nouvel hôpital dans Google Sheets"""
    # Vérifier si l'email existe déjà
    existing = sheets_service.get_hospital_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré")
    
    # Créer l'hôpital
    success = sheets_service.create_hospital(data.dict())
    
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de l'inscription")
    
    # Récupérer l'hôpital créé pour obtenir l'ID
    hospital = sheets_service.get_hospital_by_email(data.email)
    
    if not hospital:
        raise HTTPException(status_code=500, detail="Hôpital créé mais non trouvé")
    
    # Créer le token JWT
    access_token = create_access_token(data={"sub": data.email, "hospital_id": hospital['id']})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "hospital_id": hospital['id'],
        "nom": hospital['nom'],
        "email": hospital['email']
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    """Connexion d'un hôpital via Google Sheets"""
    hospital = sheets_service.get_hospital_by_email(credentials.email)
    
    if not hospital:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Vérifier le mot de passe
    if not verify_password(credentials.password, hospital['mot_de_passe']):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Créer le token JWT
    access_token = create_access_token(data={"sub": credentials.email, "hospital_id": hospital['id']})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "hospital_id": hospital['id'],
        "nom": hospital['nom'],
        "email": hospital['email']
    }

@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Récupérer les informations de l'hôpital connecté"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    hospital = sheets_service.get_hospital_by_email(email)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hôpital non trouvé")
    
    # Supprimer le mot de passe de la réponse
    hospital.pop('mot_de_passe', None)
    
    return hospital

def get_current_hospital_sheets(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dépendance pour récupérer l'hôpital courant depuis Google Sheets"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    hospital = sheets_service.get_hospital_by_email(email)
    if not hospital:
        raise HTTPException(status_code=401, detail="Hôpital non trouvé")
        
    return hospital
