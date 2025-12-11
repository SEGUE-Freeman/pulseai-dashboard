from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError

from app.db.session import get_db
from app.db.models.hospital import Hospital
from app.schemas.auth import HospitalRegister, HospitalLogin, Token
from app.core.security import verify_password, get_password_hash
from app.core.jwt import create_access_token, decode_access_token

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token)
def register(hospital: HospitalRegister, db: Session = Depends(get_db)):
    # Vérifier si l'email existe déjà
    db_hospital = db.query(Hospital).filter(Hospital.email == hospital.email).first()
    if db_hospital:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Créer le nouvel hôpital
    hashed_password = get_password_hash(hospital.password)
    new_hospital = Hospital(
        name=hospital.name,
        email=hospital.email,
        password=hashed_password,
        address=hospital.address,
        phone=hospital.phone
    )
    db.add(new_hospital)
    db.commit()
    db.refresh(new_hospital)
    
    # Créer le token
    access_token = create_access_token(data={"sub": hospital.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
def login(credentials: HospitalLogin, db: Session = Depends(get_db)):
    # Trouver l'hôpital
    hospital = db.query(Hospital).filter(Hospital.email == credentials.email).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Vérifier le mot de passe
    if not verify_password(credentials.password, hospital.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Créer le token
    access_token = create_access_token(data={"sub": hospital.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

def get_current_hospital(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Hospital:
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    hospital = db.query(Hospital).filter(Hospital.email == email).first()
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hospital not found"
        )
    
    return hospital
