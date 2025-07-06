export const monitoringConfig = {
  services: [
    {
      name: 'Frontend',
      url: 'http://localhost:3005',
      expectedStatus: 200
    },
    {
      name: 'Authentication',
      url: 'http://localhost:3006',
      expectedStatus: 200
    },
    {
      name: 'Analysis',
      url: 'http://localhost:3002',
      expectedStatus: 200
    }
  ],
  checkInterval: 30, // secondes
  responseThreshold: 5000, // ms
}; 