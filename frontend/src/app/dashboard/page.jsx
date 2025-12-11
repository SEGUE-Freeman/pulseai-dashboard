'use client';
import { useState, useEffect } from 'react';
import { hospitalAPI } from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/ui/Card';
import HistoryChart from '../../components/analytics/HistoryChart';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

export default function Page(){
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await hospitalAPI.getDashboard();
      setStats(data);
      toast.success('Données du tableau de bord chargées !');
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <Skeleton variant="text" />
                <Skeleton variant="text" className="h-8 w-20" />
              </Card>
            ))}
          </div>
          <Card>
            <Skeleton variant="rect" className="h-64" />
          </Card>
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <Skeleton count={3} variant="text" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getOccupancyBadge = (rate) => {
    if (rate >= 90) return { variant: 'error', label: 'Critique' };
    if (rate >= 75) return { variant: 'warning', label: 'Élevée' };
    if (rate >= 50) return { variant: 'success', label: 'Normale' };
    return { variant: 'info', label: 'Faible' };
  };

  const occupancyBadge = getOccupancyBadge(stats?.occupancy_rate || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Lits Disponibles</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-pulsegreen to-green-500 bg-clip-text text-transparent">
              {stats?.available_beds || 0}
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Occupation</div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-pulseblue to-blue-500 bg-clip-text text-transparent">
                {stats?.occupancy_rate || 0}%
              </div>
              <Badge variant={occupancyBadge.variant} size="sm">
                {occupancyBadge.label}
              </Badge>
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Médecins</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.active_doctors || 0}
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">Services</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats?.active_services || 0}
            </div>
          </Card>
        </div>

        <Card title="Historique des capacités" className="hover:shadow-lg transition-shadow">
          <HistoryChart />
        </Card>
      </section>
      
      <aside className="space-y-6">
        <Card title="Score PulseAI" className="hover:shadow-lg transition-shadow">
          <div className="text-center py-6">
            <div className="text-5xl font-bold bg-gradient-to-r from-pulsegreen to-pulseblue bg-clip-text text-transparent mb-2">
              {stats?.hospital_score?.toFixed(1) || '0.0'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">sur 10</div>
            <Badge variant="pulsegreen" className="mt-3">
              Excellent
            </Badge>
          </div>
        </Card>
        
        <Card title="Activité du jour" className="hover:shadow-lg transition-shadow">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Patients reçus</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats?.patients_today || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Recommandations</span>
              <Badge variant="pulseblue">
                {stats?.recommendations_today || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">File d'attente</span>
              <Badge variant={stats?.waiting_queue > 10 ? 'error' : 'info'}>
                {stats?.waiting_queue || 0}
              </Badge>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}
