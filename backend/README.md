# PulseAI Backend

Backend FastAPI pour le Dashboard PulseAI.

## Installation

```bash
pip install -r requirements.txt
```

## Initialisation de la base de données

```bash
python init_db.py
```

## Lancement du serveur

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Documentation API

Une fois le serveur lancé:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints principaux

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion

### Hôpital
- `GET /api/v1/hospital/me` - Profile
- `PUT /api/v1/hospital/me` - Mise à jour du profile
- `GET /api/v1/hospital/dashboard` - Dashboard complet

### Services
- `GET /api/v1/services/` - Liste des services
- `POST /api/v1/services/` - Créer un service
- `PUT /api/v1/services/{id}` - Modifier un service
- `DELETE /api/v1/services/{id}` - Supprimer un service

### Capacité
- `GET /api/v1/capacity/` - Obtenir la capacité
- `POST /api/v1/capacity/` - Créer la capacité
- `PUT /api/v1/capacity/` - Modifier la capacité

### Location
- `GET /api/v1/location/` - Obtenir la localisation
- `POST /api/v1/location/` - Créer la localisation
- `PUT /api/v1/location/` - Modifier la localisation

### Équipement
- `GET /api/v1/equipment/` - Liste des équipements
- `POST /api/v1/equipment/` - Créer un équipement
- `PUT /api/v1/equipment/{id}` - Modifier un équipement
- `DELETE /api/v1/equipment/{id}` - Supprimer un équipement
