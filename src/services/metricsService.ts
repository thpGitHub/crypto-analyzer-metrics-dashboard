export interface Alert {
  type: 'status_change' | 'high_latency';
  message: string;
  timestamp: string;
  fromStatus?: string;
  toStatus?: string;
  responseTime?: number;
  threshold?: number;
  url: string;
  error?: string;
  serviceName?: string;
  metricId: number;
}

export interface Metric {
  id: number;
  serviceName: string;
  status: string;
  responseTime: number;
  url: string;
  timestamp: string;
  error?: string;
  alerts: Alert[];
}

export interface ServiceStatus {
  status: string;
  uptime: number;
  services: Array<{
    name: string;
    status: string;
    lastCheck: string;
  }>;
}

export const metricsService = {
  async getMetrics(): Promise<Metric[]> {
    const response = await fetch('/api/metrics');
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    return response.json();
  },

  async getServiceStatus(): Promise<ServiceStatus> {
    const response = await fetch('/api/status');
    if (!response.ok) {
      throw new Error('Failed to fetch service status');
    }
    return response.json();
  }
}; 