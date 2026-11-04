const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const { authRoutes } = require('./modules/auth/auth.routes');
const { userRoutes } = require('./modules/users/user.routes');
const { organizationRoutes } = require('./modules/organizations/organization.routes');
const { membershipRoutes } = require('./modules/memberships/membership.routes');
const { teamRoutes } = require('./modules/teams/team.routes');
const { projectRoutes } = require('./modules/projects/project.routes');
const { taskRoutes } = require('./modules/tasks/task.routes');

const app = express();

// Enable CORS with credentials for cookies support
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Body and Cookie parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Project Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// Database availability check to prevent unhandled buffering timeouts
const mongoose = require('mongoose');
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      status: -1,
      message: 'Database is currently unavailable. Please start the MongoDB service.',
    });
  }
  next();
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Catch-all handler routed through centralized error handling
app.use((req, res, next) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
