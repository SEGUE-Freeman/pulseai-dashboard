'use client';
import { useState, useEffect } from 'react';
import { equipmentAPI } from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const CATEGORIES = ['Médical', 'Diagnostic', 'Chirurgical', 'Laboratoire', 'Urgences', 'Autre'];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Médical',
    is_functional: true,
    quantity: 1
  });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const data = await equipmentAPI.getAll();
      setEquipment(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await equipmentAPI.update(editingItem.id, formData);
      } else {
        await equipmentAPI.create(formData);
      }
      await loadEquipment();
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet équipement ?')) {
      try {
        await equipmentAPI.delete(id);
        await loadEquipment();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Médical', is_functional: true, quantity: 1 });
    setEditingItem(null);
    setShowForm(false);
  };

  const groupedEquipment = equipment.reduce((acc, item) => {
    const cat = item.category || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">⚕️ Équipements Médicaux</h1>
          <p className="text-gray-600 mt-1">Gérez votre inventaire d'équipements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Ajouter'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Modifier' : 'Nouvel équipement'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de l'équipement</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantité</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_functional}
                  onChange={(e) => setFormData({ ...formData, is_functional: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Fonctionnel</span>
              </label>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">{editingItem ? 'Mettre à jour' : 'Ajouter'}</Button>
              <Button type="button" onClick={resetForm} className="bg-gray-500">Annuler</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Equipment List by Category */}
      {Object.keys(groupedEquipment).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedEquipment).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-3 text-pulsegreen">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        item.is_functional ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.is_functional ? '✓ OK' : '✗ Panne'}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setShowForm(true);
                        }}
                        className="text-sm text-pulseblue hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Aucun équipement enregistré</p>
        </div>
      )}
    </div>
  );
}
