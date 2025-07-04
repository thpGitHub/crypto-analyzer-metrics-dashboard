'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { metricsService, Metric } from '@/services/metricsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ResponseTimeDistribution() {
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

  // Créer des tranches de 500ms
  const ranges = [
    '0-500', 
    '501-1000', 
    '1001-2000', 
    '2001-3000', 
    '3001-4000', 
    '4001-5000',
    '5000+'
  ];

  const distribution = ranges.map(range => {
    const [min, max] = range === '5000+' 
      ? [5000, Infinity] 
      : range.split('-').map(Number);
    
    return metrics.filter(m => 
      m.responseTime >= min && m.responseTime <= max
    ).length;
  });

  const data = {
    labels: ranges,
    datasets: [
      {
        label: 'Nombre de requêtes',
        data: distribution,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de requêtes'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Temps de réponse (ms)'
        }
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  );
} 