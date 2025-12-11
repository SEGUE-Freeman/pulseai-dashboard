'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function Home(){
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(()=> {
    if (!loading && user) {
      router.push('/dashboard');
    }
  },[user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pulsegreen/10 to-pulseblue/10">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pulsegreen border-t-transparent"></div>
          <div className="text-pulsegreen text-xl font-medium">Chargement...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pulsegreen/5 to-pulseblue/10">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pulsegreen to-pulseblue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pulsegreen to-pulseblue bg-clip-text text-transparent">
              PulseAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-pulsegreen transition-colors">
              Connexion
            </Link>
            <Link href="/auth/register" className="bg-pulsegreen text-white px-6 py-2 rounded-lg hover:bg-pulsegreen/90 transition-all transform hover:scale-105">
              Inscription
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pulsegreen to-pulseblue bg-clip-text text-transparent">
                Gérez votre hôpital
              </span>
              <br />
              <span className="text-gray-800">en toute simplicité</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Plateforme intelligente pour la gestion hospitalière en Afrique. 
              Optimisez vos capacités, connectez-vous aux patients, améliorez votre service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-gradient-to-r from-pulsegreen to-pulseblue text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105">
                Commencer gratuitement
              </Link>
              <Link href="#features" className="bg-white text-gray-800 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-pulsegreen transition-all">
                Découvrir les fonctionnalités
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🏥', title: 'Gestion des Services', desc: 'Gérez vos services médicaux, médecins et équipements en temps réel' },
              { icon: '📊', title: 'Analytics Avancés', desc: 'Visualisez vos statistiques et optimisez vos performances' },
              { icon: '🗺️', title: 'Localisation GPS', desc: 'Soyez visible sur la carte pour les patients qui ont besoin de vous' },
              { icon: '⚡', title: 'Temps Réel', desc: 'Mettez à jour vos capacités en direct pour mieux servir' },
              { icon: '🔐', title: 'Sécurisé', desc: 'Vos données sont protégées avec les dernières technologies' },
              { icon: '📱', title: '100% Responsive', desc: 'Accédez à votre dashboard depuis n\'importe quel appareil' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className={`p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-pulsegreen hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-pulsegreen to-pulseblue rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">Prêt à commencer ?</h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez des centaines d'hôpitaux qui font confiance à PulseAI
            </p>
            <Link href="/auth/register" className="inline-block bg-white text-pulsegreen px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105">
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pulsegreen to-pulseblue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold">PulseAI</span>
          </div>
          <p className="text-gray-400 mb-4">
            Plateforme de gestion hospitalière intelligente pour l'Afrique
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 PulseAI. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
