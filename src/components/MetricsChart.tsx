'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { metricsService, Metric } from '@/services/metricsService';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MetricsChart() {
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
    return (
      <div className="text-red-600">
        {error}
      </div>
    );
  }

  if (metrics.length === 0) {
    return <div>Loading...</div>;
  }

  const chartData = {
    labels: metrics.map(metric => 
      format(new Date(metric.timestamp), 'HH:mm:ss', { locale: fr })
    ),
    datasets: [
      {
        label: 'Response Time (ms)',
        data: metrics.map(metric => metric.responseTime),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Milliseconds'
        }
      }
    }
  };

  return (
    <div className="h-[400px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
} 