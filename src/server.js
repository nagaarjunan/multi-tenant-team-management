require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
let server;

// Handle uncaught exceptions (synchronous bugs)
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. Initialize MongoDB connection
    await connectDB();

    // 2. Start Express HTTP server
    server = app.listen(PORT, () => {
      logger.success(`Server is running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
      logger.info(`Base URL: http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled Promise rejections (asynchronous errors)
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED PROMISE REJECTION: ${err?.message || err}\n${err?.stack || ''}`);
  if (server) {
    server.close(() => {
      logger.warn('Server closed due to unhandled promise rejection.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown handling
const shutdown = () => {
  logger.info('Received termination signal. Closing server gracefully...');
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
