# PulseAI Hospital Dashboard

Prototype de tableau de bord web pour la gestion d'informations hospitalières. Le dépôt réunit une API FastAPI et une interface Next.js. Le projet est présenté comme un prototype logiciel ; il ne constitue pas un système validé pour un usage clinique ou opérationnel.

## Architecture

- `backend/` : API REST FastAPI, routes d'authentification, hôpitaux, services, capacités, localisation et équipements.
- `frontend/` : interface Next.js et React, lancée par défaut sur le port 3001.
- `DEPLOY_RENDER.md` : notes de déploiement, si vous choisissez Render.

## Démarrage local

### API

Depuis le dossier `backend` :

```bash
python -m venv .venv
# Windows : .venv\Scripts\activate
# macOS / Linux : source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Documentation interactive : <http://localhost:8000/docs>.

### Interface

Depuis le dossier `frontend` :

```bash
npm install
npm run dev
```

L'interface est disponible sur <http://localhost:3001>. Configurez son URL d'API dans son fichier d'environnement local selon la configuration du backend.

## Configuration

Le backend charge sa configuration depuis l'environnement et un fichier local `.env`. Consultez `backend/app/core/config.py` pour les noms de variables attendus. Ne publiez pas de clés, mots de passe, jetons ou fichiers de credentials.

## Technologies

FastAPI, SQLAlchemy, Pydantic, Next.js 13, React 18, Tailwind CSS, Chart.js et Leaflet.

## Limites et données

Le code inclut des fonctionnalités d'authentification et de gestion de données hospitalières. N'y connectez pas de données réelles, personnelles ou médicales sans autorisation explicite, contrôle d'accès, protection des secrets et examen de sécurité adaptés. Les routes Google Sheets sont désactivées dans le point d'entrée actuel.

## État du projet

Ce dépôt documente une application en développement. Vérifiez la configuration, les dépendances et les limites du code avant toute mise en service.
