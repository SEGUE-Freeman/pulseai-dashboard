"""
Routes API pour la gestion des hôpitaux via Google Sheets
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import math

from .google_sheets_service import sheets_service

router = APIRouter(prefix="/api/v1/hospitals", tags=["Hospitals"])


# ============= MODELS =============

class HospitalCreate(BaseModel):
    nom: str
    email: EmailStr
    password: str
    telephone: str
    adresse: str
    ville: str
    region: str
    pays: str = "Sénégal"
    latitude: float
    longitude: float
    description: str = ""
    type_etablissement: str = "Public"
    nombre_lits: int = 0
    horaires_ouverture: str = "24h/24"
    site_web: Optional[str] = None
    image_url: Optional[str] = None


class HospitalLogin(BaseModel):
    email: EmailStr
    password: str


class HospitalVerify(BaseModel):
    id: str  # L'email de l'hôpital
    code: str  # Le mot de passe


class ServiceCreate(BaseModel):
    nom_service: str
    departement: str
    disponibilite: str = "Lun-Ven 8h-18h"
    specialites: str = ""
    medecins_disponibles: int = 0
    equipements: str = ""
    tarif_consultation: float = 0.0
    commentaires: str = ""


class ReviewCreate(BaseModel):
    note: float
    service_utilise: str
    commentaire: str = ""
    date_visite: Optional[str] = None


class HospitalSearchParams(BaseModel):
    service: Optional[str] = None
    ville: Optional[str] = None
    region: Optional[str] = None
    type_etablissement: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rayon_km: Optional[float] = 50.0


# ============= HELPER FUNCTIONS =============

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance entre deux points GPS en km (formule de Haversine)"""
    R = 6371  # Rayon de la Terre en km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return round(distance, 2)


# ============= ENDPOINTS =============

@router.post("/register")
async def register_hospital(hospital: HospitalCreate):
    """Enregistrer un nouvel hôpital"""
    # Vérifier si l'email existe déjà
    existing = sheets_service.get_hospital_by_email(hospital.email)
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Créer l'hôpital
    success = sheets_service.create_hospital(hospital.dict())
    
    if success:
        return {
            "message": "Hôpital enregistré avec succès",
            "email": hospital.email
        }
    else:
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement")


@router.post("/login")
async def login_hospital(credentials: HospitalLogin):
    """Connexion d'un hôpital"""
    import hashlib
    
    hospital = sheets_service.get_hospital_by_email(credentials.email)
    
    if not hospital:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Vérifier le mot de passe
    password_hash = hashlib.sha256(credentials.password.encode()).hexdigest()
    
    if hospital['mot_de_passe'] != password_hash:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # TODO: Générer un token JWT
    return {
        "message": "Connexion réussie",
        "hospital_id": hospital['id'],
        "nom": hospital['nom'],
        "email": hospital['email']
    }


@router.post("/verify")
async def verify_hospital(credentials: HospitalVerify):
    """
    Vérifie les identifiants d'un hôpital (utilisé par le frontend pour la connexion).
    Retourne {valid: true} si les identifiants sont corrects, {valid: false} sinon.
    """
    import hashlib
    
    # L'ID est l'email
    hospital = sheets_service.get_hospital_by_email(credentials.id)
    
    if not hospital:
        return {"valid": False, "message": "Hôpital non trouvé"}
    
    # Vérifier le mot de passe
    password_hash = hashlib.sha256(credentials.code.encode()).hexdigest()
    
    if hospital['mot_de_passe'] != password_hash:
        return {"valid": False, "message": "Mot de passe incorrect"}
    
    # Identifiants valides
    return {
        "valid": True,
        "hospital_id": hospital['id'],
        "nom": hospital['nom'],
        "email": hospital['email']
    }


@router.get("/search")
async def search_hospitals(
    service: Optional[str] = Query(None, description="Service médical recherché"),
    ville: Optional[str] = Query(None, description="Ville"),
    region: Optional[str] = Query(None, description="Région"),
    type_etablissement: Optional[str] = Query(None, description="Type d'établissement"),
    latitude: Optional[float] = Query(None, description="Latitude utilisateur"),
    longitude: Optional[float] = Query(None, description="Longitude utilisateur"),
    rayon_km: Optional[float] = Query(50.0, description="Rayon de recherche en km")
):
    """
    Rechercher des hôpitaux selon différents critères
    
    Retourne une liste d'hôpitaux triée par pertinence :
    - Distance (si coordonnées fournies)
    - Note moyenne
    - Disponibilité
    """
    try:
        # Recherche dans Google Sheets
        hospitals = sheets_service.search_hospitals(
            service=service,
            ville=ville,
            region=region,
            type_etablissement=type_etablissement
        )
    except Exception as e:
        # Return empty list on error to prevent 500
        print(f"Error searching hospitals: {e}")
        return {"hospitals": [], "error": str(e)}
    
    current_time = datetime.now()
    current_hour = current_time.hour
    current_day = current_time.weekday() # 0=Lundi, 6=Dimanche
    
    # Ajouter la distance et calculer le score
    if latitude is not None and longitude is not None:
        for hospital in hospitals:
            try:
                h_lat = float(hospital.get('latitude', 0))
                h_lon = float(hospital.get('longitude', 0))
                
                if h_lat != 0 and h_lon != 0:
                    distance = calculate_distance(latitude, longitude, h_lat, h_lon)
                    hospital['distance_km'] = distance
                else:
                    hospital['distance_km'] = 999999
            except (ValueError, TypeError):
                hospital['distance_km'] = 999999
                
            # Calcul du score de recommandation (plus c'est haut, mieux c'est)
            score = 1000
            
            # 1. Pénalité de distance (très forte)
            score -= (hospital['distance_km'] * 10)
            
            # 2. Bonus de note (0-5 étoiles)
            rating = float(hospital.get('note_moyenne', 0))
            score += (rating * 50)
            
            # 3. Pénalité d'attente (si disponible)
            wait_time = int(hospital.get('temps_moyen_attente', 0))
            score -= (wait_time * 2)
            
            # 4. Bonus équipements clés (si présents dans services)
            # On agrège les équipements listés dans les services de l'hôpital
            equipment_bonus = 0
            try:
                hospital_services = sheets_service.get_services_by_hospital(hospital['id'])
                # pondération simple: Scanner > Echographe > ECG > Défibrillateur
                weights = {
                    'scanner': 150,
                    'échographe': 120,
                    'echographe': 120,
                    'ecg': 80,
                    'défibrillateur': 60,
                    'defibrillateur': 60,
                }
                seen = set()
                for srv in hospital_services:
                    eq = str(srv.get('equipements', '')).lower()
                    for key, w in weights.items():
                        if key in eq and key not in seen:
                            equipment_bonus += w
                            seen.add(key)
                hospital['equipment_bonus'] = equipment_bonus
                score += equipment_bonus
            except Exception:
                hospital['equipment_bonus'] = 0

            # 5. Vérification ouverture (simplifiée)
            hours = hospital.get('horaires_ouverture', '24h/24').lower()
            is_open = True
            if '24h' not in hours:
                # Logique très basique : si pas 24h, on suppose fermé la nuit/weekend pour l'instant
                # Idéalement il faudrait un parser plus complexe
                if current_hour < 8 or current_hour > 18 or current_day > 4:
                    is_open = False
            
            if not is_open:
                score -= 5000 # Pénalité massive si fermé
                hospital['is_open'] = False
            else:
                hospital['is_open'] = True
                
            hospital['recommendation_score'] = score
        
        # Filtrer par rayon
        hospitals = [h for h in hospitals if h['distance_km'] <= rayon_km]
        
        # Trier par score décroissant (le meilleur score en premier)
        hospitals.sort(key=lambda x: x['recommendation_score'], reverse=True)
    
    # Charger les services pour chaque hôpital (seulement les noms pour Flutter)
    for hospital in hospitals:
        services_data = sheets_service.get_services_by_hospital(hospital['id'])
        # Extraire seulement les noms des services pour Flutter
        hospital['services'] = [s.get('nom_service', '') for s in services_data]
        # Supprimer le mot de passe du résultat
        hospital.pop('mot_de_passe', None)
    
    return {
        "total": len(hospitals),
        "hospitals": hospitals
    }


@router.get("/{hospital_id}")
async def get_hospital_details(hospital_id: str):
    """Récupérer les détails complets d'un hôpital"""
    hospital = sheets_service.get_hospital_by_id(hospital_id)
    
    if not hospital:
        raise HTTPException(status_code=404, detail="Hôpital non trouvé")
    
    # Charger les services
    hospital['services'] = sheets_service.get_services_by_hospital(hospital_id)
    
    # Charger les avis
    hospital['avis'] = sheets_service.get_reviews_by_hospital(hospital_id)
    
    # Supprimer le mot de passe
    hospital.pop('mot_de_passe', None)
    
    return hospital


@router.post("/{hospital_id}/services")
async def add_service(hospital_id: str, service: ServiceCreate):
    """Ajouter un service à un hôpital"""
    # Vérifier que l'hôpital existe
    hospital = sheets_service.get_hospital_by_id(hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hôpital non trouvé")
    
    success = sheets_service.add_service(hospital_id, service.dict())
    
    if success:
        return {"message": "Service ajouté avec succès"}
    else:
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout du service")


@router.post("/{hospital_id}/reviews")
async def add_review(hospital_id: str, review: ReviewCreate, user_id: str = Query(...)):
    """Ajouter un avis pour un hôpital"""
    # Vérifier que l'hôpital existe
    hospital = sheets_service.get_hospital_by_id(hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hôpital non trouvé")
    
    # Valider la note
    if not 0 <= review.note <= 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 0 et 5")
    
    success = sheets_service.add_review(hospital_id, user_id, review.dict())
    
    if success:
        return {"message": "Avis ajouté avec succès"}
    else:
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout de l'avis")


@router.get("/{hospital_id}/reviews")
async def get_hospital_reviews(hospital_id: str):
    """Récupérer tous les avis d'un hôpital"""
    reviews = sheets_service.get_reviews_by_hospital(hospital_id)
    
    return {
        "total": len(reviews),
        "note_moyenne": sum(float(r.get('note', 0)) for r in reviews) / len(reviews) if reviews else 0,
        "reviews": reviews
    }


@router.get("/")
async def get_all_hospitals():
    """Récupérer tous les hôpitaux"""
    hospitals = sheets_service.get_all_hospitals()
    
    # Supprimer les mots de passe
    for hospital in hospitals:
        hospital.pop('mot_de_passe', None)
    
    return {
        "total": len(hospitals),
        "hospitals": hospitals
    }
