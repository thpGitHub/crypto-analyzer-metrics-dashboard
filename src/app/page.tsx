'use client';

import { Suspense } from 'react';
import MetricsChart from '@/components/MetricsChart';
import AlertsList from '@/components/AlertsList';
import ServiceStatus from '@/components/ServiceStatus';
import UptimeChart from '@/components/UptimeChart';
import ResponseTimeDistribution from '@/components/ResponseTimeDistribution';
import AlertsDistribution from '@/components/AlertsDistribution';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Crypto Analyzer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Service Status</h2>
          <Suspense fallback={<div>Loading status...</div>}>
            <ServiceStatus />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Uptime Ratio</h2>
          <Suspense fallback={<div>Loading uptime...</div>}>
            <UptimeChart />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
          <Suspense fallback={<div>Loading alerts...</div>}>
            <AlertsList />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Response Time Distribution</h2>
          <Suspense fallback={<div>Loading distribution...</div>}>
            <ResponseTimeDistribution />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Alerts by Type</h2>
          <Suspense fallback={<div>Loading alerts distribution...</div>}>
            <AlertsDistribution />
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Response Time History</h2>
          <Suspense fallback={<div>Loading metrics...</div>}>
            <MetricsChart />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
