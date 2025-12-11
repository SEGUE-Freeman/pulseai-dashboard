// API Client pour PulseAI Dashboard
// Sanitize environment variables: trim, remove trailing slashes
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const cleanedBase = rawApiUrl.trim().replace(/\/+$/g, '');
// Ensure base path includes "/api/v1" even if env var omitted it
const API_URL = cleanedBase.match(/\/api\/v1$/) ? cleanedBase : `${cleanedBase}/api/v1`;
const MOCK_MODE = String(process.env.NEXT_PUBLIC_MOCK_MODE || 'false').trim() === 'true'; // Mode mock désactivé par défaut

// Debug: afficher la configuration au chargement
console.log('🔧 API Configuration:', {
  API_URL,
  MOCK_MODE,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim(),
  NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE && process.env.NEXT_PUBLIC_MOCK_MODE.trim()
});

// Données mock pour le développement
const mockData = {
  user: {
    id: 1,
    name: "Centre Hospitalier de Yaoundé",
    email: "contact@chy.cm",
    phone: "+237 699 123 456",
    city: "Yaoundé",
    address: "Avenue de l'Indépendance",
  },
  dashboard: {
    available_beds: 45,
    occupancy_rate: 68,
    active_doctors: 23,
    active_services: 8,
    hospital_score: 8.5,
    patients_today: 127,
    recommendations_today: 34,
    waiting_queue: 12,
  },
  services: [
    { id: 1, name: "Urgences", doctors_count: 5, is_available: true, equipment: ["Défibrillateur", "ECG"] },
    { id: 2, name: "Cardiologie", doctors_count: 3, is_available: true, equipment: ["Échographe", "ECG"] },
    { id: 3, name: "Maternité", doctors_count: 4, is_available: true, equipment: ["Moniteur fœtal"] },
  ],
  capacity: {
    total_beds: 120,
    available_beds: 45,
    occupied_beds: 75,
    total_doctors: 23,
    total_nurses: 45,
    waiting_queue: 12,
  },
  location: {
    address: "Avenue de l'Indépendance",
    city: "Yaoundé",
    latitude: 3.8480,
    longitude: 11.5021,
  },
};

// Helper pour les requêtes
async function request(endpoint, options = {}) {
  console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`, { MOCK_MODE });

  // Afficher le body si présent (pour debug)
  if (options.body) {
    console.log('📦 Request Body:', options.body);
  }

  // Mode mock : retourner des données fictives
  if (MOCK_MODE) {
    console.log('⚠️ Using MOCK MODE');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simuler un délai réseau
    return mockRequest(endpoint, options);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Safe URL join: avoid double slashes and handle missing leading slash on endpoint
  const endpointPath = String(endpoint || '').trim();
  const fullURL = `${API_URL}/${endpointPath.replace(/^\/+/, '')}`;
  console.log(`📡 Fetching: ${fullURL}`);

  const response = await fetch(fullURL, config);
  console.log(`📥 Response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error Response Text:', errorText);
    let errorDetail;
    try {
      const errorJson = JSON.parse(errorText);
      errorDetail = errorJson.detail || errorJson.message || errorText;
    } catch (e) {
      errorDetail = errorText || `Erreur ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Mock requests
function mockRequest(endpoint, options = {}) {
  const method = options.method || 'GET';

  // Auth endpoints
  if (endpoint === '/auth/register' && method === 'POST') {
    return { ...mockData.user, message: 'Inscription réussie' };
  }
  if (endpoint === '/auth/login' && method === 'POST') {
    return { access_token: 'mock_token_123', token_type: 'bearer' };
  }
  if (endpoint === '/hospital/me') {
    return mockData.user;
  }
  if (endpoint === '/hospital/dashboard') {
    return mockData.dashboard;
  }

  // Services
  if (endpoint === '/services/') {
    if (method === 'GET') return mockData.services;
    if (method === 'POST') return { id: Date.now(), ...JSON.parse(options.body) };
  }

  // Capacity
  if (endpoint === '/capacity/') {
    return mockData.capacity;
  }

  // Location
  if (endpoint === '/location/') {
    return mockData.location;
  }

  // Default
  return { success: true };
}

// Auth API
export const authAPI = {
  async register(data) {
    // Adapter les données pour l'API standard
    const registerData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      region: data.region || '',
      country: data.country || 'Cameroun',
      latitude: data.latitude || 0.0,
      longitude: data.longitude || 0.0,
    };
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  },

  async login(email, password) {
    // Utiliser l'endpoint standard d'authentification
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Échec de la connexion');
    }

    return response.json();
  },

  async getMe() {
    return request('/hospital/me');
  },
};

// Hospital API
export const hospitalAPI = {
  async getProfile() {
    return request('/hospital/me');
  },

  async updateProfile(data) {
    return request('/hospital/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getDashboard() {
    return request('/hospital/dashboard');
  },

  async getServices() {
    return request('/services/');
  },
};

// Hospitals API
export const hospitalsAPI = {
  async getAll() {
    return request('/hospitals/');
  },

  async getById(id) {
    return request(`/hospitals/${id}`);
  },
};

// Services API
export const servicesAPI = {
  async getAll() {
    // Récupère tous les services de tous les hôpitaux
    return request('/services/');
  },

  async getByHospital(hospitalId) {
    // Récupère les services d'un hôpital spécifique
    return request(`/hospitals/${hospitalId}/services`);
  },

  async create(hospitalId, data) {
    // Crée un service pour un hôpital
    return request(`/hospitals/${hospitalId}/services`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(serviceId, data) {
    return request(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(serviceId) {
    return request(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  },
};

// Capacity API
export const capacityAPI = {
  async get() {
    return request('/capacity/');
  },

  async update(data) {
    return request('/capacity/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Location API
export const locationAPI = {
  async get() {
    return request('/location/');
  },

  async createOrUpdate(data) {
    return request('/location/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(data) {
    return request('/location/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Equipment API
export const equipmentAPI = {
  async getAll() {
    return request('/equipment/');
  },

  async create(data) {
    return request('/equipment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return request(`/equipment/${id}`, {
      method: 'DELETE',
    });
  },
};

// Google Sheets API
export const sheetsAPI = {
  async addHospital(data) {
    return request('/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
