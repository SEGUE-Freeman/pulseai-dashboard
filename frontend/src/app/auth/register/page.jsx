'use client';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    country: 'Cameroun'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pulsebg px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex justify-center">
            <Image src="/logo.png" alt="PulseAI" width={80} height={80} className="rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Inscription Hôpital</h1>
          <p className="text-gray-600 mt-2">Rejoignez le réseau PulseAI</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'hôpital *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Hôpital Central de Yaoundé"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@hopital.cm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Yaoundé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pulsegreen"
                >
                  <option>Cameroun</option>
                  <option>Sénégal</option>
                  <option>Côte d'Ivoire</option>
                  <option>Congo</option>
                  <option>Gabon</option>
                  <option>Bénin</option>
                  <option>Togo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pulsegreen"
                placeholder="Adresse complète de l'hôpital"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="text-pulseblue font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 PulseAI - Santé intelligente pour l'Afrique</p>
        </div>
      </div>
    </div>
  );
}
