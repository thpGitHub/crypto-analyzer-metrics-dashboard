'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { metricsService, Metric } from '@/services/metricsService';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function UptimeChart() {
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

  const upCount = metrics.filter(m => m.status === 'up').length;
  const downCount = metrics.filter(m => m.status === 'down').length;
  const uptimePercentage = ((upCount / metrics.length) * 100).toFixed(1);

  const data = {
    labels: ['Up', 'Down'],
    datasets: [
      {
        data: [upCount, downCount],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 0
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold text-green-600">{uptimePercentage}%</span>
        <span className="text-gray-500 ml-2">uptime</span>
      </div>
      <div className="h-[200px] flex justify-center">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
} 