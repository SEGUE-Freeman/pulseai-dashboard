"use client";

import { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import HistoryChart from '../../../components/analytics/HistoryChart';
import OccupancyDonut from '../../../components/analytics/OccupancyDonut';
import ServicesBarChart from '../../../components/analytics/ServicesBarChart';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [services, setServices] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [dashboard, servicesData] = await Promise.all([
        hospitalAPI.getDashboard(),
        hospitalAPI.getServices(),
      ]);
      setDashboardData(dashboard);
      setServices(servicesData);
      toast.success('Données analytics chargées');
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-10 w-64" />
          <Skeleton variant="rect" className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton count={2} />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <Skeleton variant="rect" className="h-64" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const occupancyRate = dashboardData?.occupancy_rate || 0;
  const getOccupancyStatus = (rate) => {
    if (rate >= 90) return { variant: 'error', label: 'Critique', color: 'red' };
    if (rate >= 75) return { variant: 'warning', label: 'Élevée', color: 'orange' };
    if (rate >= 50) return { variant: 'success', label: 'Normale', color: 'green' };
    return { variant: 'info', label: 'Faible', color: 'blue' };
  };

  const status = getOccupancyStatus(occupancyRate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pulsegreen to-pulseblue bg-clip-text text-transparent">
            Analytics & Statistiques
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Vue d'ensemble des performances de l'hôpital
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-gradient-to-r from-pulsegreen to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          🔄 Actualiser
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Taux d'occupation" 
          className="hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold text-${status.color}-600 dark:text-${status.color}-400`}>
              {occupancyRate}%
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </Card>
        <Card 
          title="Score PulseAI" 
          color="green"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="text-3xl font-bold bg-gradient-to-r from-pulsegreen to-green-600 bg-clip-text text-transparent">
            {dashboardData?.hospital_score?.toFixed(1) || '0.0'}/10
          </div>
        </Card>
        <Card 
          title="Patients aujourd'hui" 
          color="purple"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {dashboardData?.patients_today || 0}
          </div>
        </Card>
        <Card 
          title="Recommandations" 
          color="orange"
          className="hover:shadow-xl transition-shadow"
        >
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {dashboardData?.recommendations_today || 0}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Évolution des capacités"
          className="hover:shadow-xl transition-shadow"
        >
          <HistoryChart />
        </Card>
        
        <Card 
          title="Répartition de l'occupation"
          className="hover:shadow-xl transition-shadow"
        >
          <OccupancyDonut 
            available={dashboardData?.available_beds || 0}
            occupied={(dashboardData?.total_beds || 0) - (dashboardData?.available_beds || 0)}
          />
        </Card>
      </div>

      <Card 
        title="Performance des services"
        className="hover:shadow-xl transition-shadow"
      >
        <ServicesBarChart services={services} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🏥</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.active_services || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Services actifs</div>
          </div>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">👨‍⚕️</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.active_doctors || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Médecins actifs</div>
          </div>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.waiting_queue || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">File d'attente</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
