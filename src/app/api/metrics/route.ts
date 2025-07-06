import { NextResponse } from 'next/server';
import { monitoringConfig } from '@/config/monitoring';
import prisma from '@/lib/prisma';

async function checkService(service: typeof monitoringConfig.services[0]) {
  const startTime = Date.now();
  try {
    const response = await fetch(service.url);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Générer les alertes si nécessaire
    const alerts = [];
    
    // Alerte de changement de statut
    if (response.status !== service.expectedStatus) {
      alerts.push({
        type: 'status_change',
        message: `Service ${service.name} is down`,
        timestamp: new Date().toISOString(),
        fromStatus: 'up',
        toStatus: 'down',
        url: service.url,
        error: `Unexpected status: ${response.status}`
      });
    }

    // Alerte de latence élevée
    if (responseTime > monitoringConfig.responseThreshold) {
      alerts.push({
        type: 'high_latency',
        message: `High latency detected for ${service.name}`,
        timestamp: new Date().toISOString(),
        responseTime,
        threshold: monitoringConfig.responseThreshold,
        url: service.url
      });
    }

    return {
      url: service.url,
      name: service.name,
      status: response.status === service.expectedStatus ? 'up' : 'down',
      responseTime,
      timestamp: new Date(),
      error: response.status !== service.expectedStatus ? `Unexpected status: ${response.status}` : undefined,
      alerts
    };
  } catch (error) {
    const alerts = [{
      type: 'status_change',
      message: `Service ${service.name} is unreachable`,
      timestamp: new Date().toISOString(),
      fromStatus: 'up',
      toStatus: 'down',
      url: service.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    }];

    return {
      url: service.url,
      name: service.name,
      status: 'down',
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
      alerts
    };
  }
}

export async function GET() {
  try {
    // Vérifier tous les services
    const checks = await Promise.all(
      monitoringConfig.services.map(checkService)
    );

    // Sauvegarder les métriques et les alertes dans la base de données
    await Promise.all(checks.map(async check => {
      const metric = await prisma.metric.create({
        data: {
          url: check.url,
          serviceName: check.name,
          status: check.status,
          responseTime: check.responseTime,
          timestamp: check.timestamp,
          error: check.error,
          alerts: {
            create: check.alerts.map(alert => ({
              type: alert.type,
              message: alert.message,
              timestamp: new Date(alert.timestamp),
              fromStatus: alert.fromStatus,
              toStatus: alert.toStatus,
              responseTime: alert.responseTime,
              threshold: alert.threshold,
              url: alert.url,
              error: alert.error
            }))
          }
        }
      });
      return metric;
    }));

    // Récupérer les dernières métriques avec leurs alertes
    const latestMetrics = await prisma.metric.findMany({
      take: 100,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        alerts: true
      }
    });

    return NextResponse.json(latestMetrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 