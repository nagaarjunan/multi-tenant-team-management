const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { authRoutes } = require('./modules/auth/auth.routes');
const { userRoutes } = require('./modules/users/user.routes');
const { organizationRoutes } = require('./modules/organizations/organization.routes');
const { membershipRoutes } = require('./modules/memberships/membership.routes');
const { teamRoutes } = require('./modules/teams/team.routes');
const { projectRoutes } = require('./modules/projects/project.routes');
const { taskRoutes } = require('./modules/tasks/task.routes');
const errorHandler = require('./middleware/errorHandler');

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

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Project Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Catch-all handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handling middleware
app.use(errorHandler);

module.exports = app;
