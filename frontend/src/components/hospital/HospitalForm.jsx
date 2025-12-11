import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { sheetsAPI } from '../../lib/api';

export default function HospitalForm() {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    services: '',
    address: '',
    opening_hours: '24/7'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data for backend
      const data = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        services: formData.services, // Backend expects comma separated string or we handle it there? 
        // Backend sheets_service expects 'services' as string in dict, then hospital.py splits it.
        // Let's send it as is.
        address: formData.address,
        opening_hours: formData.opening_hours,
        id: Date.now().toString(), // Generate a simple ID for now
        rating: 0,
        rating_count: 0
      };

      await sheetsAPI.addHospital(data);
      alert('Hôpital ajouté avec succès au Google Sheet !');
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        services: '',
        address: '',
        opening_hours: '24/7'
      });
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'ajout: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Ajouter un Hôpital (Google Sheets)</h2>

      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nom de l'hôpital"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          placeholder="Latitude (ex: 3.8480)"
          type="number"
          step="any"
          required
        />
        <Input
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          placeholder="Longitude (ex: 11.5021)"
          type="number"
          step="any"
          required
        />
      </div>

      <Input
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Adresse complète"
        required
      />

      <Input
        name="services"
        value={formData.services}
        onChange={handleChange}
        placeholder="Services (séparés par des virgules: Urgences, Cardiologie...)"
        required
      />

      <Input
        name="opening_hours"
        value={formData.opening_hours}
        onChange={handleChange}
        placeholder="Heures d'ouverture (ex: 24/7, 08h-20h)"
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Enregistrement...' : 'Ajouter au Google Sheet'}
      </Button>
    </form>
  );
}
