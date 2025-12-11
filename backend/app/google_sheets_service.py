"""
Service pour gérer les interactions avec Google Sheets
"""
import os
from typing import List, Dict, Optional, Any
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime
import hashlib

class GoogleSheetsService:
    def __init__(self):
        self.credentials_path = os.getenv('GOOGLE_CREDENTIALS_PATH', './pulseai-backend-94eaf873090c.json')
        self.credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
        # ID du Google Sheet fourni par l'utilisateur
        self.sheet_id = os.getenv('GOOGLE_SHEET_ID', '1SWJT1LKs_ceHoydS-kKk6OfufWzceCaG5FqcoDRrIUQ')
        self.scopes = ['https://www.googleapis.com/auth/spreadsheets']
        self.service = None
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialise la connexion avec Google Sheets API"""
        try:
            # Try to use JSON from environment variable first
            if self.credentials_json and self.credentials_json.strip():
                import json
                credentials_info = json.loads(self.credentials_json)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_info,
                    scopes=self.scopes
                )
            elif os.path.exists(self.credentials_path):
                # Fallback to file if it exists
                credentials = service_account.Credentials.from_service_account_file(
                    self.credentials_path,
                    scopes=self.scopes
                )
            else:
                raise FileNotFoundError(
                    f"Google credentials not found. Please set GOOGLE_CREDENTIALS_JSON environment variable "
                    f"or provide credentials file at {self.credentials_path}"
                )
            self.service = build('sheets', 'v4', credentials=credentials)
            print(f"✅ Google Sheets Service initialisé avec succès. ID Sheet: {self.sheet_id}")
        except Exception as e:
            print(f"❌ Erreur d'initialisation Google Sheets: {e}")
            raise
    
    def _read_range(self, range_name: str) -> List[List[Any]]:
        """Lit une plage de cellules"""
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.sheet_id,
                range=range_name
            ).execute()
            return result.get('values', [])
        except HttpError as e:
            print(f"Erreur lecture {range_name}: {e}")
            return []
    
    def _write_range(self, range_name: str, values: List[List[Any]]) -> bool:
        """Écrit dans une plage de cellules"""
        try:
            body = {'values': values}
            self.service.spreadsheets().values().update(
                spreadsheetId=self.sheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            return True
        except HttpError as e:
            print(f"Erreur écriture {range_name}: {e}")
            return False
    
    def _append_row(self, sheet_name: str, values: List[Any]) -> bool:
        """Ajoute une ligne à la fin d'une feuille"""
        try:
            body = {'values': [values]}
            self.service.spreadsheets().values().append(
                spreadsheetId=self.sheet_id,
                range=f"{sheet_name}!A:Z",
                valueInputOption='USER_ENTERED',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()
            return True
        except HttpError as e:
            print(f"Erreur ajout ligne {sheet_name}: {e}")
            return False
    
    def _find_row_index(self, sheet_name: str, column_index: int, value: str) -> Optional[int]:
        """Trouve l'index de la ligne (1-based) contenant une valeur spécifique dans une colonne"""
        # Lire une plage plus large pour inclure toutes les colonnes potentielles
        data = self._read_range(f'{sheet_name}!A:AC')
        if not data:
            return None
        
        for i, row in enumerate(data):
            if len(row) > column_index and row[column_index] == value:
                return i + 1  # 1-based index
        return None

    # ============= HOPITAUX =============
    
    def get_all_hospitals(self) -> List[Dict]:
        """Récupère tous les hôpitaux avec leurs services"""
        data = self._read_range('Hopitaux!A2:Z1000')
        if not data:
            return []
        
        # Structure complète du Google Sheet Hopitaux:
        # id, nom, adresse, ville, region, pays, latitude, longitude, telephone, email,
        # description, type_etablissement, nombre_lits, horaires_ouverture, site_web, image_url,
        # capacite_totale, capacite_disponible, temps_moyen_attente, note_moyenne, nombre_avis, statut,
        # created_at, updated_at
        headers = [
            'id', 'nom', 'adresse', 'ville', 'region', 'pays',
            'latitude', 'longitude', 'telephone', 'email',
            'description', 'type_etablissement', 'nombre_lits',
            'horaires_ouverture', 'site_web', 'image_url',
            'capacite_totale', 'capacite_disponible', 'temps_moyen_attente',
            'note_moyenne', 'nombre_avis', 'statut',
            'created_at', 'updated_at'
        ]
        
        # Récupérer tous les services
        services_data = self._read_range('Services!A2:F1000')
        services_by_hospital = {}
        if services_data:
            for service_row in services_data:
                if len(service_row) >= 3:
                    hopital_id = service_row[1]
                    service_nom = service_row[2]
                    if hopital_id not in services_by_hospital:
                        services_by_hospital[hopital_id] = []
                    services_by_hospital[hopital_id].append(service_nom)
        
        hospitals = []
        for row in data:
            # Compléter les colonnes manquantes avec des valeurs vides
            row_data = row + [''] * (len(headers) - len(row))
            hospital = dict(zip(headers, row_data))
            
            # Convertir les types avec gestion des erreurs et #ERROR!
            def safe_float(val):
                try:
                    if val in ['', None, '#ERROR!', '#N/A', '#REF!']:
                        return 0.0
                    # Handle French locale comma separator
                    if isinstance(val, str):
                        val = val.replace(',', '.')
                    return float(val)
                except (ValueError, TypeError):
                    return 0.0
            
            def safe_int(val):
                try:
                    if val in ['', None, '#ERROR!', '#N/A', '#REF!']:
                        return 0
                    # Handle French locale comma separator
                    if isinstance(val, str):
                        val = val.replace(',', '.')
                    return int(float(val))
                except (ValueError, TypeError):
                    return 0
            
            hospital['latitude'] = safe_float(hospital.get('latitude'))
            hospital['longitude'] = safe_float(hospital.get('longitude'))
            hospital['capacite_totale'] = safe_int(hospital.get('capacite_totale'))
            hospital['capacite_disponible'] = safe_int(hospital.get('capacite_disponible'))
            hospital['note_moyenne'] = safe_float(hospital.get('note_moyenne'))
            hospital['nombre_lits'] = safe_int(hospital.get('nombre_lits'))
            hospital['nombre_avis'] = safe_int(hospital.get('nombre_avis'))
            
            # Ajouter les services de cet hôpital
            hopital_id = hospital.get('id', '')
            hospital['services'] = ','.join(services_by_hospital.get(hopital_id, []))
            
            hospitals.append(hospital)
        
        return hospitals
    
    def get_hospital_by_id(self, hospital_id: str) -> Optional[Dict]:
        """Récupère un hôpital par son ID"""
        hospitals = self.get_all_hospitals()
        for hospital in hospitals:
            if hospital['id'] == hospital_id:
                return hospital
        return None
    
    def _get_col_letter(self, col_index: int) -> str:
        """Convertit un index de colonne (0-based) en lettre (A, B, ..., Z, AA, AB...)"""
        string = ""
        while col_index >= 0:
            string = chr((col_index % 26) + 65) + string
            col_index = (col_index // 26) - 1
        return string

    def get_hospital_by_email(self, email: str) -> Dict:
        """Récupère un hôpital par son email avec authentification depuis Utilisateurs"""
        # 1. Vérifier l'utilisateur dans la feuille Utilisateurs
        users_data = self._read_range('Utilisateurs!A2:G1000')
        user = None
        if users_data:
            user_headers = ['id', 'email', 'password_hash', 'nom_hopital', 'role', 'created_at', 'last_login']
            for row in users_data:
                row_data = row + [''] * (len(user_headers) - len(row))
                user_dict = dict(zip(user_headers, row_data))
                if user_dict['email'].lower() == email.lower():
                    user = user_dict
                    break
        
        if not user:
            return None
        
        # 2. Récupérer les données de l'hôpital depuis Hopitaux par nom
        hospitals_data = self._read_range('Hopitaux!A2:X1000')
        if not hospitals_data:
            return None
            
        headers = [
            'id', 'nom', 'adresse', 'ville', 'region', 'pays',
            'latitude', 'longitude', 'telephone', 'email',
            'description', 'type_etablissement', 'nombre_lits',
            'horaires_ouverture', 'site_web', 'image_url',
            'capacite_totale', 'capacite_disponible', 'temps_moyen_attente',
            'note_moyenne', 'nombre_avis', 'statut',
            'created_at', 'updated_at'
        ]
        
        def safe_float(val):
            try:
                if val in ['', None, '#ERROR!', '#N/A', '#REF!']:
                    return 0.0
                # Handle French locale comma separator
                if isinstance(val, str):
                    val = val.replace(',', '.')
                return float(val)
            except (ValueError, TypeError):
                return 0.0
        
        def safe_int(val):
            try:
                if val in ['', None, '#ERROR!', '#N/A', '#REF!']:
                    return 0
                # Handle French locale comma separator
                if isinstance(val, str):
                    val = val.replace(',', '.')
                return int(float(val))
            except (ValueError, TypeError):
                return 0
        
        for row in hospitals_data:
            row_data = row + [''] * (len(headers) - len(row))
            hospital = dict(zip(headers, row_data))
            
            # Chercher par email ou par nom d'hôpital
            if hospital.get('email', '').lower() == email.lower() or hospital.get('nom', '') == user.get('nom_hopital', ''):
                hospital['latitude'] = safe_float(hospital.get('latitude'))
                hospital['longitude'] = safe_float(hospital.get('longitude'))
                hospital['capacite_totale'] = safe_int(hospital.get('capacite_totale'))
                hospital['capacite_disponible'] = safe_int(hospital.get('capacite_disponible'))
                hospital['note_moyenne'] = safe_float(hospital.get('note_moyenne'))
                
                # Ajouter les infos d'authentification depuis Utilisateurs
                hospital['mot_de_passe'] = user.get('password_hash', '')
                hospital['user_id'] = user.get('id', '')
                hospital['role'] = user.get('role', '')
                
                return hospital
        
        return None
    
    def create_hospital(self, hospital_data: Dict) -> bool:
        """Crée un nouvel hôpital"""
        # Générer un ID unique
        hospital_id = f"H{datetime.now().strftime('%y%m%d%H%M%S')}"
        
        # Structure complète:
        # id, nom, adresse, ville, region, pays, latitude, longitude, telephone, email,
        # description, type_etablissement, nombre_lits, horaires_ouverture, site_web, image_url,
        # capacite_totale, capacite_disponible, temps_moyen_attente, note_moyenne, nombre_avis, statut,
        # created_at, updated_at
        row = [
            hospital_id,
            hospital_data.get('nom', ''),
            hospital_data.get('adresse', ''),
            hospital_data.get('ville', ''),
            hospital_data.get('region', ''),
            hospital_data.get('pays', 'Sénégal'),
            hospital_data.get('latitude', 0.0),
            hospital_data.get('longitude', 0.0),
            hospital_data.get('telephone', ''),
            hospital_data.get('email', ''),
            hospital_data.get('description', ''),
            hospital_data.get('type_etablissement', 'Public'),
            hospital_data.get('nombre_lits', 0),
            hospital_data.get('horaires_ouverture', '24h/24'),
            hospital_data.get('site_web', ''),
            hospital_data.get('image_url', ''),
            hospital_data.get('capacite_totale', 0),
            hospital_data.get('capacite_disponible', 0),
            0,  # temps_moyen_attente
            0.0,  # note_moyenne
            0,  # nombre_avis
            'Actif',  # statut
            datetime.now().strftime('%Y-%m-%d'),
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ]
        
        # Créer aussi l'utilisateur dans la feuille Utilisateurs pour l'authentification
        if hospital_data.get('email') and hospital_data.get('password'):
            password_hash = hashlib.sha256(hospital_data.get('password', '').encode()).hexdigest()
            user_id = f"U{datetime.now().strftime('%y%m%d%H%M%S')}"
            user_row = [
                user_id,
                hospital_data.get('email', ''),
                password_hash,
                hospital_data.get('nom', ''),
                'hospital',  # role
                datetime.now().strftime('%Y-%m-%d'),
                ''  # last_login
            ]
            self._append_row('Utilisateurs', user_row)
        
        return self._append_row('Hopitaux', row)
    
    def update_hospital(self, hospital_id: str, updates: Dict) -> bool:
        """Met à jour un hôpital"""
        # Trouver la ligne de l'hôpital (ID est en colonne 0, donc A)
        row_index = self._find_row_index('Hopitaux', 0, hospital_id)
        if not row_index:
            print(f"Hôpital {hospital_id} non trouvé pour mise à jour")
            return False
            
        # Mapping des champs vers les colonnes (0-based) selon nouvelle structure:
        # id(0), nom(1), adresse(2), ville(3), region(4), pays(5),
        # latitude(6), longitude(7), telephone(8), email(9),
        # description(10), type_etablissement(11), nombre_lits(12),
        # horaires_ouverture(13), site_web(14), image_url(15),
        # capacite_totale(16), capacite_disponible(17), temps_moyen_attente(18),
        # note_moyenne(19), nombre_avis(20), statut(21),
        # created_at(22), updated_at(23)
        field_map = {
            'nom': 1, 'adresse': 2, 'ville': 3, 'region': 4, 'pays': 5,
            'latitude': 6, 'longitude': 7, 'telephone': 8, 'email': 9,
            'description': 10, 'type_etablissement': 11, 'nombre_lits': 12,
            'horaires_ouverture': 13, 'site_web': 14, 'image_url': 15,
            'capacite_totale': 16, 'capacite_disponible': 17, 'temps_moyen_attente': 18,
            'note_moyenne': 19, 'nombre_avis': 20, 'statut': 21
        }
        
        for field, value in updates.items():
            if field in field_map:
                col_index = field_map[field]
                # Convertir l'index de colonne en lettre
                col_letter = self._get_col_letter(col_index)
                cell_range = f'Hopitaux!{col_letter}{row_index}'
                
                # Écrire la valeur
                self._write_range(cell_range, [[value]])
                
        # Mettre à jour la date de modification (colonne X -> index 23)
        self._write_range(f'Hopitaux!X{row_index}', [[datetime.now().strftime('%Y-%m-%d %H:%M:%S')]])
        
        return True
    
    # ============= SERVICES =============
    
    def get_services_by_hospital(self, hospital_id: str) -> List[Dict]:
        """Récupère tous les services d'un hôpital"""
        data = self._read_range('Services!A2:L1000')
        if not data:
            return []
        
        # Structure: id, hopital_id, nom_service, departement, disponibilite,
        # specialites, medecins_disponibles, equipements, tarif_consultation,
        # commentaires, statut, date_ajout
        headers = ['id', 'hopital_id', 'nom_service', 'departement', 'disponibilite',
                   'specialites', 'medecins_disponibles', 'equipements', 'tarif_consultation',
                   'commentaires', 'statut', 'date_ajout']
        
        services = []
        for row in data:
            row_data = row + [''] * (len(headers) - len(row))
            service = dict(zip(headers, row_data))
            
            if service['hopital_id'] == hospital_id:
                services.append(service)
        
        return services
    
    def search_hospitals_by_service(self, service_name: str) -> List[str]:
        """Recherche les hôpitaux proposant un service spécifique"""
        data = self._read_range('Services!A2:L1000')
        if not data:
            return []
        
        hospital_ids = set()
        # Structure: id, hopital_id, nom_service, departement, disponibilite, ...
        for row in data:
            if len(row) >= 3:
                nom_service = row[2].lower()  # colonne 'nom_service'
                if service_name.lower() in nom_service:
                    hospital_ids.add(row[1])  # colonne 'hopital_id'
        
        return list(hospital_ids)
    
    def create_service(self, service_data: Dict) -> str:
        """Crée un nouveau service (alias pour add_service pour compatibilité)"""
        return self.add_service(service_data.get('hopital_id'), service_data)

    def add_service(self, hospital_id: str, service_data: Dict) -> str:
        """Ajoute un service à un hôpital"""
        service_id = f"SRV{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        row = [
            service_id,
            hospital_id,
            service_data.get('nom_service', ''),
            service_data.get('departement', ''),
            service_data.get('disponibilite', ''),
            service_data.get('specialites', ''),
            service_data.get('medecins_disponibles', 0),
            service_data.get('equipements', ''),
            service_data.get('tarif_consultation', 0),
            service_data.get('commentaires', ''),
            'Actif',
            datetime.now().strftime('%Y-%m-%d')
        ]
        
        if self._append_row('Services', row):
            return service_id
        return None

    def update_service(self, service_id: str, updates: Dict) -> bool:
        """Met à jour un service"""
        row_index = self._find_row_index('Services', 0, service_id)
        if not row_index:
            return False
            
        # Mapping des champs
        # ['id', 'hopital_id', 'nom_service', 'departement', 'disponibilite',
        #  'specialites', 'medecins_disponibles', 'equipements', 'tarif_consultation',
        #  'commentaires', 'statut', 'date_ajout']
        
        field_map = {
            'nom_service': 2, 'departement': 3, 'disponibilite': 4,
            'specialites': 5, 'medecins_disponibles': 6, 'equipements': 7,
            'tarif_consultation': 8, 'commentaires': 9, 'statut': 10
        }
        
        for field, value in updates.items():
            if field in field_map:
                col_index = field_map[field]
                col_letter = self._get_col_letter(col_index)
                cell_range = f'Services!{col_letter}{row_index}'
                self._write_range(cell_range, [[value]])
                
        return True

    def delete_service(self, service_id: str) -> bool:
        """Supprime un service (marquage comme Inactif ou suppression ligne)"""
        # Pour l'instant, on marque comme Inactif (colonne K -> index 10)
        row_index = self._find_row_index('Services', 0, service_id)
        if not row_index:
            return False
            
        self._write_range(f'Services!K{row_index}', [['Inactif']])
        return True
    
    # ============= AVIS =============
    
    def get_reviews_by_hospital(self, hospital_id: str) -> List[Dict]:
        """Récupère tous les avis d'un hôpital"""
        data = self._read_range('Avis!A2:Z1000')
        if not data:
            return []
        
        headers = ['id', 'hopital_id', 'utilisateur_id', 'note', 'service_utilise',
                   'commentaire', 'criteres_notes', 'date_visite', 'date_avis',
                   'verifie', 'statut']
        
        reviews = []
        for row in data:
            row_data = row + [''] * (len(headers) - len(row))
            review = dict(zip(headers, row_data))
            
            if review['hopital_id'] == hospital_id and review['statut'] == 'Publié':
                try:
                    review['note'] = float(review['note']) if review['note'] else 0.0
                    review['verifie'] = review['verifie'].upper() == 'TRUE'
                except ValueError:
                    pass
                reviews.append(review)
        
        return reviews
    
    def add_review(self, hospital_id: str, user_id: str, review_data: Dict) -> bool:
        """Ajoute un avis pour un hôpital et met à jour la note moyenne"""
        review_id = f"AV{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        new_rating = float(review_data.get('note', 0))
        
        row = [
            review_id,
            hospital_id,
            user_id,
            new_rating,
            review_data.get('service_utilise', ''),
            review_data.get('commentaire', ''),
            review_data.get('criteres_notes', ''),
            review_data.get('date_visite', datetime.now().strftime('%Y-%m-%d')),
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'FALSE',
            'Publié'
        ]
        
        if not self._append_row('Avis', row):
            return False
            
        # Recalculer la note moyenne de l'hôpital
        reviews = self.get_reviews_by_hospital(hospital_id)
        if reviews:
            # Convertir toutes les notes en float
            valid_ratings = []
            for r in reviews:
                try:
                    note = float(r['note']) if r['note'] else 0.0
                    if note > 0:
                        valid_ratings.append(note)
                except (ValueError, TypeError):
                    continue
            
            if valid_ratings:
                avg_rating = sum(valid_ratings) / len(valid_ratings)
                
                # Mettre à jour l'hôpital
                # Colonne T (index 19) = note_moyenne, Colonne U (index 20) = nombre_avis
                hospital_row_index = self._find_row_index('Hopitaux', 0, hospital_id)
                if hospital_row_index:
                    self._write_range(f'Hopitaux!T{hospital_row_index}', [[round(avg_rating, 1)]])
                    self._write_range(f'Hopitaux!U{hospital_row_index}', [[len(reviews)]])
                
        return True

    # ============= EQUIPEMENTS =============

    def get_equipment_by_hospital(self, hospital_id: str) -> List[Dict]:
        """Récupère tous les équipements d'un hôpital"""
        data = self._read_range('Equipements!A2:Z1000')
        if not data:
            return []
        
        headers = ['id', 'hopital_id', 'nom', 'quantite', 'disponible', 'etat', 'date_ajout']
        
        equipment_list = []
        for row in data:
            row_data = row + [''] * (len(headers) - len(row))
            item = dict(zip(headers, row_data))
            
            if item['hopital_id'] == hospital_id:
                try:
                    item['quantite'] = int(item['quantite']) if item['quantite'] else 0
                    item['disponible'] = int(item['disponible']) if item['disponible'] else 0
                except ValueError:
                    pass
                equipment_list.append(item)
        
        return equipment_list

    def add_equipment(self, hospital_id: str, equipment_data: Dict) -> str:
        """Ajoute un équipement à un hôpital"""
        equipment_id = f"EQ{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        row = [
            equipment_id,
            hospital_id,
            equipment_data.get('name', ''),
            equipment_data.get('quantity', 0),
            equipment_data.get('available', 0),
            'Fonctionnel',
            datetime.now().strftime('%Y-%m-%d')
        ]
        
        if self._append_row('Equipements', row):
            return equipment_id
        return None

    def update_equipment(self, equipment_id: str, updates: Dict) -> bool:
        """Met à jour un équipement"""
        row_index = self._find_row_index('Equipements', 0, equipment_id)
        if not row_index:
            return False
            
        # Mapping: id(0), hopital_id(1), nom(2), quantite(3), disponible(4), etat(5), date_ajout(6)
        field_map = {'name': 2, 'quantity': 3, 'available': 4, 'etat': 5}
        
        for field, value in updates.items():
            if field in field_map:
                col_index = field_map[field]
                col_letter = chr(65 + col_index)
                self._write_range(f'Equipements!{col_letter}{row_index}', [[value]])
                
        return True

    def delete_equipment(self, equipment_id: str) -> bool:
        """Supprime un équipement (en fait, on pourrait juste le marquer comme supprimé, mais ici on supprime la ligne)"""
        # L'API Sheets v4 ne permet pas de supprimer facilement une ligne sans faire un batchUpdate complexe
        # Pour simplifier, on va vider la ligne ou marquer comme 'Supprimé' dans la colonne etat
        row_index = self._find_row_index('Equipements', 0, equipment_id)
        if not row_index:
            return False
            
        # Marquer comme supprimé (colonne F -> index 5)
        self._write_range(f'Equipements!F{row_index}', [['Supprimé']])
        return True
    
    # ============= RECHERCHE AVANCÉE =============
    
    def search_hospitals(self, 
                        service: Optional[str] = None,
                        ville: Optional[str] = None,
                        region: Optional[str] = None,
                        type_etablissement: Optional[str] = None) -> List[Dict]:
        """Recherche avancée d'hôpitaux"""
        hospitals = self.get_all_hospitals()
        
        # Filtrer par service si spécifié
        if service:
            # Filter directly from hospital services column (simpler approach)
            filtered = []
            for h in hospitals:
                # Get services from the hospital (column 8 -> index 'services')
                services_str = h.get('services', '')
                if isinstance(services_str, list):
                    services_list = services_str
                else:
                    services_list = [s.strip() for s in str(services_str).split(',') if s.strip()]
                
                if service in services_list:
                    filtered.append(h)
            hospitals = filtered
        
        # Filtrer par ville
        if ville:
            hospitals = [h for h in hospitals if h.get('ville', '').lower() == ville.lower()]
        
        # Filtrer par région
        if region:
            hospitals = [h for h in hospitals if h.get('region', '').lower() == region.lower()]
        
        # Filtrer par type
        if type_etablissement:
            hospitals = [h for h in hospitals if h.get('type_etablissement', '').lower() == type_etablissement.lower()]
        
        # Trier par note
        hospitals.sort(key=lambda x: float(x.get('note_moyenne', 0) or 0), reverse=True)
        
        return hospitals


# Instance globale
sheets_service = GoogleSheetsService()
