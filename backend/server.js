// TerraVerify Backend Server Entry Point
require('dotenv').config();
const app = require('./src/app');
const { checkConnection } = require('./src/config/db');

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  // Verify database connectivity before opening port
  const dbStatus = await checkConnection();
  if (!dbStatus.ok) {
    console.error('[Database Error] Failed to connect to MySQL:', dbStatus.error);
    console.warn('[Database Warning] Starting server anyway (endpoints may fail if MySQL is offline).');
  } else {
    console.log(`[Database Connected] MySQL database "${dbStatus.database}" is ready.`);
  }

  const server = app.listen(PORT, () => {
    console.log(`TerraVerify API Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Startup Error] Port ${PORT} is already in use by another running instance.`);
    } else {
      console.error('[Startup Error]', err.message);
    }
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Shutdown] Shutting down TerraVerify API server...');
    server.close(() => {
      console.log('[Shutdown] Server closed gracefully.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
