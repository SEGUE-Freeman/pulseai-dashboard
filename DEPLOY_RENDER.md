# Guide de Déploiement du Dashboard PulseAI sur Render

Ce guide explique comment déployer le Dashboard Web PulseAI (backend et frontend) sur Render.

## 📋 Prérequis

- Compte Render (https://render.com)
- Dépôt Git connecté à Render
- Variables d'environnement configurées

## 🚀 Déploiement du Backend

### Option 1 : Déploiement via l'interface Render

1. **Connectez-vous à Render** : https://dashboard.render.com

2. **Créer un nouveau Web Service** :
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre dépôt GitHub : `neuractif-initiatives/ai4y-delta-lom25`
   - Sélectionnez la branche : `BENDOH`

3. **Configuration du service Backend** :
   - **Name** : `pulseai-dashboard-backend`
   - **Region** : Frankfurt (ou votre choix)
   - **Branch** : `BENDOH`
   - **Root Directory** : `DASHBOARD WEB/backend`
   - **Environment** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Variables d'environnement à configurer** :
   ```
   PYTHON_VERSION=3.11.0
   SECRET_KEY=[généré automatiquement ou votre clé]
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DATABASE_URL=[votre URL de base de données si nécessaire]
   GOOGLE_SHEETS_CREDENTIALS=[vos credentials JSON Google Sheets]
   GOOGLE_SHEETS_SPREADSHEET_ID=[ID de votre spreadsheet]
   ```

5. **Déployer** : Cliquez sur "Create Web Service"

### Option 2 : Déploiement via render.yaml

Le fichier `render.yaml` est déjà configuré dans `DASHBOARD WEB/backend/render.yaml`. Render le détectera automatiquement.

## 🌐 Déploiement du Frontend

### Configuration du service Frontend

1. **Créer un nouveau Web Service** :
   - Cliquez sur "New +" → "Web Service"
   - Utilisez le même dépôt

2. **Configuration** :
   - **Name** : `pulseai-dashboard-frontend`
   - **Region** : Frankfurt
   - **Branch** : `BENDOH`
   - **Root Directory** : `DASHBOARD WEB/frontend`
   - **Environment** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`

3. **Variables d'environnement** :
   ```
   NODE_VERSION=18.17.0
   NEXT_PUBLIC_API_URL=https://pulseai-dashboard-backend.onrender.com
   PORT=3001
   ```
   
   ⚠️ **Important** : Remplacez `NEXT_PUBLIC_API_URL` par l'URL réelle de votre backend une fois déployé.

4. **Déployer** : Cliquez sur "Create Web Service"

## 🔄 Mise à jour du CORS Backend

Après le déploiement du frontend, mettez à jour la configuration CORS dans `backend/app/main.py` pour autoriser votre domaine Render :

```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pulseai-dashboard-frontend.onrender.com",  # Ajoutez votre URL Render
    # ... autres origines
],
```

## 🔐 Configuration des Secrets

### Google Sheets API

1. Dans Render, allez dans les paramètres de votre service backend
2. Ajoutez `GOOGLE_SHEETS_CREDENTIALS` avec le contenu JSON de vos credentials
3. Ajoutez `GOOGLE_SHEETS_SPREADSHEET_ID` avec l'ID de votre feuille

### Secret Key

Render peut générer automatiquement une `SECRET_KEY` sécurisée, ou vous pouvez en fournir une :

```bash
# Générer une clé localement (optionnel)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📊 Vérification du Déploiement

### Backend
Testez votre API backend :
```bash
curl https://pulseai-dashboard-backend.onrender.com/
```

Vous devriez recevoir :
```json
{
  "message": "PulseAI API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

Accédez à la documentation interactive : `https://pulseai-dashboard-backend.onrender.com/docs`

### Frontend
Ouvrez votre navigateur : `https://pulseai-dashboard-frontend.onrender.com`

## 🐛 Résolution des Problèmes

### Le backend ne démarre pas
- Vérifiez les logs dans Render Dashboard
- Assurez-vous que toutes les variables d'environnement sont configurées
- Vérifiez que `requirements.txt` contient toutes les dépendances

### Le frontend ne se connecte pas au backend
- Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers la bonne URL backend
- Vérifiez la configuration CORS dans le backend
- Consultez la console du navigateur pour les erreurs

### Erreurs de timeout
- Render free tier met en veille les services inactifs
- Premier accès peut prendre 30-60 secondes
- Envisagez un plan payant pour une disponibilité continue

## 💰 Plans et Coûts

### Plan Gratuit (Free Tier)
- 750 heures/mois par service
- Services mis en veille après 15 min d'inactivité
- Redémarrage automatique lors d'une requête
- Parfait pour le développement et les tests

### Plan Starter ($7/mois par service)
- Toujours actif (pas de mise en veille)
- Meilleure performance
- Recommandé pour la production

## 🔄 Déploiement Continu

Render redéploie automatiquement lorsque vous poussez sur la branche configurée (`BENDOH`).

Pour désactiver le déploiement automatique :
1. Allez dans Settings → Build & Deploy
2. Décochez "Auto-Deploy"

## 📝 Notes Importantes

1. **Premier déploiement** : Peut prendre 5-10 minutes
2. **Cold starts** : Plan gratuit a un délai de démarrage
3. **Base de données** : Configurez PostgreSQL via Render si nécessaire
4. **Logs** : Accessibles en temps réel dans le dashboard Render
5. **Domaine personnalisé** : Configurable dans les paramètres (plans payants)

## 🔗 Liens Utiles

- [Documentation Render](https://render.com/docs)
- [Render Dashboard](https://dashboard.render.com)
- [Guide Render Python](https://render.com/docs/deploy-fastapi)
- [Guide Render Next.js](https://render.com/docs/deploy-nextjs)

## ✅ Checklist de Déploiement

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible
- [ ] Variables d'environnement configurées
- [ ] CORS mis à jour avec les URLs Render
- [ ] Tests des endpoints API
- [ ] Interface utilisateur fonctionnelle
- [ ] Google Sheets API connecté (si utilisé)
- [ ] Logs vérifiés (pas d'erreurs critiques)

---

**Prêt à déployer !** 🚀

Si vous rencontrez des problèmes, consultez les logs Render ou contactez le support.
