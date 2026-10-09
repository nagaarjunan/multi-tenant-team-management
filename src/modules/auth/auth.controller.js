const { authService } = require('./auth.service');
const { validateRegisterInput, validateLoginInput } = require('./auth.validation');

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

class AuthController {
  constructor(authSvc = authService) {
    this.authSvc = authSvc;
  }

  register = async (req, res, next) => {
    try {
      const validation = validateRegisterInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const result = await this.authSvc.register(req.body);

      // Set JWT in HTTP-only cookie
      res.cookie('token', result.token, getCookieOptions());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const result = await this.authSvc.login(req.body);

      // Set JWT in HTTP-only cookie
      res.cookie('token', result.token, getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  };

  getMe = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await this.authSvc.getCurrentUser(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  AuthController,
  authController: new AuthController(),
};
