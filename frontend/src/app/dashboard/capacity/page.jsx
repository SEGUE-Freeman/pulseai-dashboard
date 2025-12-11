'use client';
import { useState, useEffect } from 'react';
import { capacityAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

export default function CapacityPage() {
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    beds: 0,
    occupied_beds: 0,
    total_doctors: 0,
    active_doctors: 0,
    total_nurses: 0,
    active_nurses: 0,
    waiting_queue: 0,
    average_wait_time: 0
  });

  useEffect(() => {
    loadCapacity();
  }, []);

  const loadCapacity = async () => {
    try {
      const data = await capacityAPI.get();
      setCapacity(data);
      setFormData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.occupied_beds > formData.beds) {
      alert('❌ Erreur: Le nombre de lits occupés ne peut pas dépasser le nombre total de lits.');
      return;
    }
    if (formData.active_doctors > formData.total_doctors) {
      alert('❌ Erreur: Le nombre de médecins actifs ne peut pas dépasser le nombre total de médecins.');
      return;
    }
    if (formData.active_nurses > formData.total_nurses) {
      alert('❌ Erreur: Le nombre d\'infirmiers actifs ne peut pas dépasser le nombre total d\'infirmiers.');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Envoi des données de capacité:', formData);
      const result = await capacityAPI.update(formData);
      console.log('✅ Réponse du serveur:', result);
      alert('✅ Capacité mise à jour avec succès!');
      await loadCapacity();
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      const errorMessage = error?.message || error?.toString() || 'Impossible de mettre à jour la capacité';
      console.error('📛 Message d\'erreur:', errorMessage);
      alert('❌ Erreur: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const occupancyRate = capacity && capacity.beds > 0
    ? (capacity.occupied_beds / capacity.beds * 100).toFixed(1)
    : 0;

  if (loading && !capacity) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Capacité & Disponibilité</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-sm text-gray-500">Lits Totaux</div>
          <div className="text-3xl font-bold text-pulsegreen">{capacity?.beds || 0}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Lits Disponibles</div>
          <div className="text-3xl font-bold text-pulseblue">{(capacity?.beds || 0) - (capacity?.occupied_beds || 0)}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Taux d'Occupation</div>
          <div className="text-3xl font-bold text-orange-600">{occupancyRate}%</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">File d'Attente</div>
          <div className="text-3xl font-bold text-red-600">{capacity?.waiting_queue || 0}</div>
        </Card>
      </div>

      {/* Form */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Mettre à Jour la Capacité</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lits */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-pulsegreen">🛏️ Lits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lits Totaux</label>
                <input
                  type="number"
                  min="0"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lits Occupés</label>
                <input
                  type="number"
                  min="0"
                  value={formData.occupied_beds}
                  onChange={(e) => setFormData({ ...formData, occupied_beds: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Médecins */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-pulseblue">👨‍⚕️ Médecins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Médecins Totaux</label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_doctors}
                  onChange={(e) => setFormData({ ...formData, total_doctors: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Médecins Actifs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.active_doctors}
                  onChange={(e) => setFormData({ ...formData, active_doctors: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Infirmiers */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-purple-600">👩‍⚕️ Infirmiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Infirmiers Totaux</label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_nurses}
                  onChange={(e) => setFormData({ ...formData, total_nurses: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Infirmiers Actifs</label>
                <input
                  type="number"
                  min="0"
                  value={formData.active_nurses}
                  onChange={(e) => setFormData({ ...formData, active_nurses: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* File d'attente */}
          <div>
            <h3 className="font-medium text-lg mb-3 text-orange-600">⏱️ File d'Attente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Patients en Attente</label>
                <input
                  type="number"
                  min="0"
                  value={formData.waiting_queue}
                  onChange={(e) => setFormData({ ...formData, waiting_queue: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Temps d'Attente Moyen (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.average_wait_time}
                  onChange={(e) => setFormData({ ...formData, average_wait_time: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
