const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const seedDefaultUsersIfEmpty = async () => {
  try {
    const { UserModel } = require('../modules/users/user.model');
    const count = await UserModel.countDocuments();
    if (count === 0) {
      logger.info('Seeding initial demo users...');
      const hashedPassword = await bcrypt.hash('demo1234', 10);
      await UserModel.create([
        {
          name: 'admin',
          email: 'admin@slash.com',
          password: hashedPassword,
          role: 'superadmin',
        },
        {
          name: 'Alex Chen',
          email: 'alex.platform@nexusworkos.com',
          password: hashedPassword,
          role: 'superadmin',
        },
        {
          name: 'Tanaka Hiroshi',
          email: 'tanaka@acme.com',
          password: hashedPassword,
          role: 'admin',
        },
        {
          name: 'test',
          email: 'test@slash.com',
          password: hashedPassword,
          role: 'member',
        },
      ]);
      logger.success('Initial demo users seeded successfully (default password: demo1234)');
    }
  } catch (err) {
    logger.warn(`Could not seed demo users: ${err.message}`);
  }
};

const connectDB = async (retries = 5, delay = 2000) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project_manage';

  // Attach Mongoose lifecycle events
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost. Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.success('MongoDB reconnected successfully.');
  });

  // Enable detailed Mongoose database query logging
  if (process.env.NODE_ENV !== 'production' || process.env.MONGO_DEBUG === 'true') {
    mongoose.set('debug', (collectionName, method, query) => {
      try {
        const sanitizedQuery = logger.sanitize(query);
        const queryStr = JSON.stringify(sanitizedQuery);
        logger.db(`${collectionName}.${method}(${queryStr || ''})`);
      } catch {
        logger.db(`${collectionName}.${method}()`);
      }
    });
  }

  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(mongoUri);
      logger.success(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      await seedDefaultUsersIfEmpty();
      return conn;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${i}/${retries} failed: ${error.message}`);
      if (i < retries) {
        logger.info(`Retrying MongoDB connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        const errorMsg = `Could not connect to MongoDB after ${retries} attempts. Please ensure MongoDB is started: ${error.message}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  }
};

module.exports = connectDB;
