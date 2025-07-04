const METRICS_SERVICE_URL = process.env.NEXT_PUBLIC_METRICS_SERVICE_URL || 'http://localhost:3007';

export interface Alert {
  type: 'status_change' | 'high_latency';
  message?: string;
  timestamp: string;
  from?: string;
  to?: string;
  responseTime?: number;
  threshold?: number;
  url?: string;
  error?: string;
}

export interface Metric {
  id: string;
  status: string;
  responseTime: number;
  url: string;
  timestamp: string;
  error?: string;
  alerts: Alert[];
}

export const metricsService = {
  async getMetrics(): Promise<Metric[]> {
    const response = await fetch(`${METRICS_SERVICE_URL}/api/metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    return response.json();
  },

  async getServiceStatus(): Promise<{ status: string; uptime: number }> {
    const response = await fetch(`${METRICS_SERVICE_URL}/api/status`);
    if (!response.ok) {
      throw new Error('Failed to fetch service status');
    }
    return response.json();
  }
}; 