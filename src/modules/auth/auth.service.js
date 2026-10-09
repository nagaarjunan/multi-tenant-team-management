const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authRepository } = require('./auth.repository');

class AuthService {
  constructor(authRepo = authRepository) {
    this.authRepo = authRepo;
  }

  async register(data) {
    const existingUser = await this.authRepo.findByEmail(data.email);
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await this.authRepo.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'member',
    });

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(data) {
    const user = await this.authRepo.findByEmail(data.email);
    if (!user || !user.password) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getCurrentUser(userId) {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  generateToken(userId, email, role) {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ userId, email, role }, secret, { expiresIn });
  }
}

module.exports = {
  AuthService,
  authService: new AuthService(),
};
