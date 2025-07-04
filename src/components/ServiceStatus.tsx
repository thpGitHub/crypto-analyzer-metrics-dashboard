'use client';

import { useEffect, useState } from 'react';
import { metricsService } from '@/services/metricsService';

export default function ServiceStatus() {
  const [status, setStatus] = useState<{ status: string; uptime: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await metricsService.getServiceStatus();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch service status');
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (error) {
    return (
      <div className="text-red-600">
        {error}
      </div>
    );
  }

  if (!status) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className={`text-2xl font-bold ${status.status === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {status.status.toUpperCase()}
      </div>
      <div className="mt-2 text-gray-600">
        Uptime: {formatUptime(status.uptime)}
      </div>
    </div>
  );
} 