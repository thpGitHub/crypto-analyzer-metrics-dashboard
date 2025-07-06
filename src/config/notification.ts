export const notificationConfig = {
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  dashboardUrl: 'http://localhost:3000',
  notificationService: {
    url: 'http://localhost:3010',
    endpoints: {
      email: '/api/notifications/email'
    }
  }
}; 