'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { metricsService, Alert } from '@/services/metricsService';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AlertsDistribution() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const metrics = await metricsService.getMetrics();
        const allAlerts = metrics.flatMap(m => m.alerts || []);
        setAlerts(allAlerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Chargement des alertes...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!alerts || alerts.length === 0) return <div>Aucune alerte</div>;

  // Compter les types d'alertes
  const alertTypes = {
    'status_change': alerts.filter(a => a.type === 'status_change').length,
    'high_latency': alerts.filter(a => a.type === 'high_latency').length
  };

  const data = {
    labels: ['Changement de statut', 'Latence élevée'],
    datasets: [
      {
        data: [alertTypes['status_change'], alertTypes['high_latency']],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Distribution des Alertes</h2>
      <div className="w-full h-64">
        <Pie 
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </div>
    </div>
  );
} 