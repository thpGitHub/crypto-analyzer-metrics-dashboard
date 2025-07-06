import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { monitoringConfig } from '@/config/monitoring';
import { notificationConfig } from '@/config/notification';

// Cache pour stocker le dernier statut connu de chaque service
let serviceStatusCache = new Map<string, string>();

async function checkService(service: typeof monitoringConfig.services[0]) {
  try {
    const response = await fetch(service.url, { 
      method: 'GET',
      // Timeout après 5 secondes
      signal: AbortSignal.timeout(5000)
    });
    return response.status === service.expectedStatus ? 'up' : 'down';
  } catch (error) {
    return 'down';
  }
}

async function notifyServiceStatusChange(service: { name: string; status: string; lastCheck: string; previousStatus: string }) {
  try {
    const { url, endpoints } = notificationConfig.notificationService;
    const response = await fetch(`${url}${endpoints.email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: notificationConfig.adminEmail,
        subject: `🔴 Service ${service.name} est ${service.status.toUpperCase()}`,
        template: "alert",
        data: {
          serviceName: service.name,
          status: service.status,
          previousStatus: service.previousStatus,
          timestamp: service.lastCheck,
          dashboardUrl: notificationConfig.dashboardUrl
        }
      })
    });

    if (!response.ok) {
      console.error(`Failed to send notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export async function GET() {
  try {
    // Vérifier l'état actuel de chaque service
    const servicesStatus = await Promise.all(monitoringConfig.services.map(async service => {
      const currentStatus = await checkService(service);
      const previousStatus = serviceStatusCache.get(service.name) || 'unknown';
      const now = new Date().toISOString();
      
      const status = {
        name: service.name,
        status: currentStatus,
        lastCheck: now,
        previousStatus
      };

      // Si le statut a changé, envoyer une notification
      if (currentStatus !== previousStatus) {
        notifyServiceStatusChange(status);
        serviceStatusCache.set(service.name, currentStatus);

        // Sauvegarder la métrique dans la base de données
        await prisma.metric.create({
          data: {
            serviceName: service.name,
            status: currentStatus,
            responseTime: 0, // On ne mesure pas le temps de réponse pour l'instant
            url: service.url,
            timestamp: new Date(now),
            error: currentStatus === 'down' ? 'Service inaccessible' : undefined
          }
        });
      }

      return status;
    }));

    // Calculer le statut global
    const allUp = servicesStatus.every(s => s.status === 'up');
    const someDown = servicesStatus.some(s => s.status === 'down');
    const upCount = servicesStatus.filter(s => s.status === 'up').length;
    const uptime = (upCount / servicesStatus.length) * 100;

    // Déterminer le statut global
    let globalStatus;
    if (allUp) {
      globalStatus = 'up';
    } else if (someDown && upCount > 0) {
      globalStatus = 'degraded';
    } else {
      globalStatus = 'down';
    }

    return NextResponse.json({
      status: globalStatus,
      uptime: Math.round(uptime * 100) / 100,
      services: servicesStatus
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
} 