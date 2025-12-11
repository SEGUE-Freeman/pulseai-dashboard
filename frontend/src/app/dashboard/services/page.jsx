'use client';
import { useState, useEffect } from 'react';
import { servicesAPI, hospitalsAPI } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const SERVICES_PRESETS = [
  { name: 'Urgences', description: 'Service des urgences 24h/24' },
  { name: 'Cardiologie', description: 'Service de cardiologie' },
  { name: 'Maternité', description: 'Service de maternité et gynécologie' },
  { name: 'Pédiatrie', description: 'Service de pédiatrie et néonatologie' },
  { name: 'Radiologie', description: 'Service de radiologie et imagerie médicale' },
  { name: 'Chirurgie', description: 'Service de chirurgie générale' },
  { name: 'Laboratoire', description: 'Analyses et examens de laboratoire' },
  { name: 'Consultation', description: 'Consultations externes' },
  { name: 'Dermatologie', description: 'Service de dermatologie' },
  { name: 'ORL', description: 'Oto-rhino-laryngologie' },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    disponible: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Récupérer les infos de l'hôpital connecté
      const hospitals = await hospitalsAPI.getAll();
      const myHospital = hospitals.find(h => h.email === user?.email);
      setHospitalInfo(myHospital);
      
      if (myHospital) {
        // Récupérer les services de cet hôpital depuis la table Services
        const allServices = await servicesAPI.getAll();
        const myServices = allServices.filter(s => s.hopital_id === myHospital.id);
        setServices(myServices);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hospitalInfo) {
      alert('Impossible de trouver votre hôpital');
      return;
    }
    
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, formData);
      } else {
        await servicesAPI.create(hospitalInfo.id, formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce service ?')) {
      try {
        await servicesAPI.delete(id);
        await loadData();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', description: '', disponible: true });
    setEditingService(null);
    setShowForm(false);
  };

  const selectPreset = (preset) => {
    setFormData({
      nom: preset.name,
      description: preset.description,
      disponible: true
    });
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services Médicaux</h1>
          <p className="text-gray-600 mt-1">Gérez les services disponibles dans votre établissement</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Ajouter un service'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingService ? 'Modifier le service' : 'Nouveau service'}
          </h3>

          {/* Presets */}
          {!editingService && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Services pré-définis</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SERVICES_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className="p-3 border rounded-lg hover:bg-pulsebg text-center transition"
                  >
                    <div className="text-2xl mb-1">{preset.icon}</div>
                    <div className="text-sm">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du service</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-700">Service disponible</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Description du service médical..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingService ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" onClick={resetForm} className="bg-gray-500">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <Card key={service.id} className="hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{service.nom}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                )}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                service.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {service.disponible ? 'Disponible' : 'Fermé'}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setEditingService(service);
                  setFormData({
                    nom: service.nom,
                    description: service.description || '',
                    disponible: service.disponible
                  });
                  setShowForm(true);
                }}
                className="text-sm text-pulseblue hover:underline"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </Card>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Aucun service médical enregistré</p>
          <p className="text-sm">Commencez par ajouter vos services médicaux</p>
        </div>
      )}
    </div>
  );
}

