'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { metricsService, Metric } from '@/services/metricsService';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AlertsDistribution() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricsService.getMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch metrics');
        console.error(err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (metrics.length === 0) {
    return <div>Loading...</div>;
  }

  // Extraire toutes les alertes
  const alerts = metrics.flatMap(m => m.alerts);
  
  // Compter les types d'alertes
  const alertTypes = {
    'status_change': alerts.filter(a => a.type === 'status_change').length,
    'high_latency': alerts.filter(a => a.type === 'high_latency').length
  };

  const data = {
    labels: ['Changement de statut', 'Latence élevée'],
    datasets: [
      {
        data: [alertTypes.status_change, alertTypes.high_latency],
        backgroundColor: [
          'rgba(234, 179, 8, 0.5)',
          'rgba(239, 68, 68, 0.5)'
        ],
        borderColor: [
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  const totalAlerts = alerts.length;

  return (
    <div>
      <div className="text-center mb-4">
        <span className="text-2xl font-bold">{totalAlerts}</span>
        <span className="text-gray-500 ml-2">alertes au total</span>
      </div>
      <div className="h-[200px] flex justify-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
} 