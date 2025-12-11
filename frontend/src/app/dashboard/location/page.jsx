'use client';
import { useState, useEffect } from 'react';
import { locationAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import dynamic from 'next/dynamic';

// Import Map dynamically (client-side only)
const MapPicker = dynamic(() => import('../../../components/hospital/MapPicker'), { ssr: false });

export default function LocationPage() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    latitude: 3.8480,
    longitude: 11.5021,
    google_maps_url: '',
    address: '',
    city: '',
    country: ''
  });

  // Coordonnées par défaut par pays
  const COUNTRY_COORDS = {
    'Cameroun': { lat: 3.8480, lon: 11.5021 },
    'Sénégal': { lat: 14.7167, lon: -17.4677 },
    'Togo': { lat: 6.1375, lon: 1.2125 },
    'Côte d\'Ivoire': { lat: 5.3600, lon: -4.0083 },
    'Mali': { lat: 12.6392, lon: -8.0029 },
    'Burkina Faso': { lat: 12.3714, lon: -1.5197 },
    'Bénin': { lat: 6.4969, lon: 2.6289 },
    'Niger': { lat: 13.5116, lon: 2.1254 }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const data = await locationAPI.get();
      
      // Si on a des coordonnées valides (différentes de 0), on les utilise
      if (data && (data.latitude !== 0 || data.longitude !== 0)) {
        setLocation(data);
        setFormData({
          latitude: data.latitude,
          longitude: data.longitude,
          google_maps_url: data.google_maps_url || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
        });
      } else if (data && data.country && COUNTRY_COORDS[data.country]) {
        // Sinon on utilise les coordonnées du pays
        const coords = COUNTRY_COORDS[data.country];
        setFormData(prev => ({
          ...prev,
          latitude: coords.lat,
          longitude: coords.lon,
          address: data.address || '',
          city: data.city || '',
          country: data.country || ''
        }));
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        alert('Position obtenue avec succès !');
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        let msg = 'Erreur inconnue';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msg = "Vous avez refusé la demande de géolocalisation. Veuillez l'autoriser dans les paramètres de votre navigateur.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Les informations de localisation ne sont pas disponibles.";
            break;
          case error.TIMEOUT:
            msg = "La demande de localisation a expiré.";
            break;
        }
        alert('Erreur : ' + msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 Envoi des données de localisation:', formData);
      const result = await locationAPI.update(formData);
      console.log('✅ Réponse du serveur:', result);
      alert('✅ Localisation mise à jour avec succès!');
      await loadLocation();
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      const errorMessage = error?.message || error?.toString() || 'Impossible de mettre à jour la localisation';
      console.error('📛 Message d\'erreur:', errorMessage);
      alert('❌ Erreur: ' + errorMessage);
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📍 Localisation GPS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Coordonnées GPS</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lien Google Maps (optionnel)</label>
              <input
                type="url"
                value={formData.google_maps_url}
                onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={getCurrentPosition} className="bg-pulseblue">
                📍 Ma Position Actuelle
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>

          {location && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Position Enregistrée</h3>
              <div className="text-sm text-gray-600">
                <p>Lat: {location.latitude}</p>
                <p>Lng: {location.longitude}</p>
                {location.google_maps_url && (
                  <a href={location.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-pulseblue hover:underline">
                    Voir sur Google Maps →
                  </a>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Map */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Carte Interactive</h2>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapPicker
              lat={formData.latitude}
              lon={formData.longitude}
              onPosChange={(lat, lon) => setFormData({ ...formData, latitude: lat, longitude: lon })}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Cliquez sur la carte pour ajuster la position du marqueur
          </p>
        </Card>
      </div>
    </div>
  );
}
