'use client';

import { useEffect, useState } from 'react';
import { metricsService, Alert } from '@/services/metricsService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const metrics = await metricsService.getMetrics();
        // Extraire toutes les alertes des métriques
        const allAlerts = metrics
          .flatMap(metric => metric.alerts.map(alert => ({
            ...alert,
            serviceName: metric.serviceName,
            metricId: metric.id
          })))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
        setAlerts(allAlerts);
        setError(null);
      } catch (err) {
        setError('Failed to fetch alerts');
        console.error(err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="text-red-600">
        {error}
      </div>
    );
  }

  if (alerts.length === 0) {
    return <div className="text-gray-500">Aucune alerte récente</div>;
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'bg-yellow-50 text-yellow-700';
      case 'high_latency':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatAlertMessage = (alert: Alert) => {
    if (alert.type === 'status_change') {
      return `Service ${alert.serviceName}: ${alert.fromStatus || 'up'} → ${alert.toStatus || 'down'}`;
    }
    if (alert.type === 'high_latency') {
      return `${alert.serviceName} - Latence élevée: ${alert.responseTime}ms (seuil: ${alert.threshold}ms)`;
    }
    return alert.message || 'Alerte inconnue';
  };

  return (
    <ul className="space-y-2">
      {alerts.map((alert, index) => (
        <li
          key={`${alert.timestamp}-${index}`}
          className={`p-3 rounded ${getAlertColor(alert.type)}`}
        >
          <div className="font-medium">
            {formatAlertMessage(alert)}
          </div>
          <div className="text-xs mt-1 opacity-75">
            {format(new Date(alert.timestamp), 'PPP à HH:mm:ss', { locale: fr })}
          </div>
        </li>
      ))}
    </ul>
  );
} 