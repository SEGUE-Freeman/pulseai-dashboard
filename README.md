# PulseAI Hospital Dashboard

Tableau de bord web pour la gestion hospitalière PulseAI avec backend FastAPI et frontend Next.js.

## 🏗️ Architecture

- **Backend** : FastAPI (Python) - API REST pour la gestion des données
- **Frontend** : Next.js (React) - Interface utilisateur moderne
- **Déploiement** : Render.com

## 📁 Structure du Projet

```
pulseai-dashboard-repo/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Routes API
│   │   ├── core/           # Configuration
│   │   ├── db/             # Base de données
│   │   └── main.py         # Point d'entrée
│   ├── Dockerfile
│   ├── render.yaml
│   └── requirements.txt
│
├── frontend/                # Application Next.js
│   ├── src/
│   │   ├── app/            # Pages et layouts
│   │   ├── components/     # Composants React
│   │   ├── contexts/       # Contextes React
│   │   └── lib/            # Utilitaires
│   ├── public/
│   ├── render.yaml
│   └── package.json
│
└── DEPLOY_RENDER.md        # Guide de déploiement
```

## 🚀 Installation Locale

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Accédez à :
- Backend API: http://localhost:8000
- Frontend: http://localhost:3001
- Documentation API: http://localhost:8000/docs

## 🌐 Déploiement sur Render

Suivez le guide complet dans `DEPLOY_RENDER.md` pour déployer sur Render.com.

### Résumé Rapide

1. Créer un compte sur https://render.com
2. Connecter votre dépôt GitHub
3. Créer deux Web Services (backend et frontend)
4. Configurer les variables d'environnement
5. Déployer !

## 🔐 Variables d'Environnement

### Backend (.env)
```env
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=your-database-url
GOOGLE_SHEETS_CREDENTIALS=your-google-credentials
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Fonctionnalités

- 🏥 Gestion des hôpitaux
- 👨‍⚕️ Gestion des médecins
- 🛏️ Gestion des lits et chambres
- 📈 Visualisation des capacités
- 🗺️ Carte interactive des hôpitaux
- 📊 Tableaux de bord et statistiques
- 🔐 Authentification et autorisation

## 🛠️ Technologies

### Backend
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- Google Sheets API
- Python-Jose (JWT)

### Frontend
- Next.js 13
- React 18
- Tailwind CSS
- Chart.js
- Leaflet (cartes)
- React Context API

## 📝 API Endpoints

- `GET /` - Informations sur l'API
- `GET /docs` - Documentation Swagger interactive
- `GET /api/v1/hospitals` - Liste des hôpitaux
- `POST /api/v1/auth/login` - Authentification
- Plus d'endpoints dans la documentation

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🐛 Support

Pour signaler un bug ou demander une fonctionnalité, ouvrez une issue sur GitHub.

## 👥 Auteurs

- **Neuractif Initiatives** - PulseAI Team

---

Fait avec ❤️ pour améliorer la gestion hospitalière
