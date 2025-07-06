'use client';

import { useEffect, useState } from 'react';
import { metricsService } from '@/services/metricsService';

interface ServiceStatusData {
  status: string;
  uptime: number;
  services: Array<{
    name: string;
    status: string;
    lastCheck: string;
  }>;
}

export default function ServiceStatus() {
  const [status, setStatus] = useState<ServiceStatusData | null>(null);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'degraded':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
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
      <div className={`text-2xl font-bold ${getStatusColor(status.status)}`}>
        {status.status.toUpperCase()}
      </div>
      <div className="mt-2 text-gray-600">
        Disponibilité: {status.uptime}%
      </div>
      <div className="mt-4 space-y-2">
        {status.services?.map(service => (
          <div key={service.name} className="flex items-center justify-between">
            <span className="font-medium">{service.name}</span>
            <span className={`px-2 py-1 rounded text-sm ${getStatusColor(service.status)}`}>
              {service.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 