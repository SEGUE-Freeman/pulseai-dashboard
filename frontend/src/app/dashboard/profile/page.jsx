'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { hospitalAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.nom || user.name || '',
        phone: user.telephone || user.phone || '',
        address: user.adresse || user.address || '',
        city: user.ville || user.city || '',
        country: user.pays || user.country || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('📤 Envoi des données:', formData);
      const result = await hospitalAPI.updateProfile(formData);
      console.log('✅ Réponse du serveur:', result);
      // Recharger les données utilisateur
      await refreshUser();
      setEditing(false);
      alert('✅ Profil mis à jour avec succès!');
    } catch (error) {
      console.error('❌ Erreur complète:', error);
      const errorMessage = error?.message || error?.toString() || 'Impossible de mettre à jour le profil';
      console.error('📛 Message d\'erreur:', errorMessage);
      alert('❌ Erreur: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">👤 Mon Profil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-pulsegreen text-white flex items-center justify-center text-4xl font-bold mb-4">
              {(user.nom || user.name)?.[0] || 'H'}
            </div>
            <h2 className="text-xl font-bold mb-2">{user.nom || user.name}</h2>
            <p className="text-gray-600 mb-1">{user.email}</p>
            <p className="text-gray-500 text-sm mb-4">
              {user.ville || user.city || ''}
              {(user.ville || user.city) && (user.pays || user.country) ? ', ' : ''}
              {user.pays || user.country || ''}
            </p>
            
            <div className="flex gap-2 justify-center mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.is_active !== false ? 'Actif' : 'Inactif'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.is_verified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {user.is_verified ? 'Vérifié' : 'Non vérifié'}
              </span>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-1">Score PulseAI</div>
              <div className="text-3xl font-bold text-pulsegreen">{(user.note_moyenne || user.score || 0).toFixed(1)}/10</div>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Informations</h2>
            {!editing && (
              <Button onClick={() => setEditing(true)}>Modifier</Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de l'hôpital</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adresse</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pays</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button type="button" onClick={() => setEditing(false)} className="bg-gray-500" disabled={loading}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Téléphone</div>
                <div className="font-medium">{user.telephone || user.phone || 'Non renseigné'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Ville</div>
                <div className="font-medium">{user.ville || user.city || 'Non renseigné'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Adresse</div>
                <div className="font-medium">{user.adresse || user.address || 'Non renseignée'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Pays</div>
                <div className="font-medium">{user.pays || user.country || 'Non renseigné'}</div>
              </div>
              {user.created_at && (
                <div>
                  <div className="text-sm text-gray-500">Membre depuis</div>
                  <div className="font-medium">{new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🚪 Se Déconnecter
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
