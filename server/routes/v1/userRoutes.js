// routes/v1/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const googleAuthController = require('../../controllers/googleAuthController');
const Joi = require('joi');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// Validation schemas
const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
      .required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.',
      }),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  forgetPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    newPassword: Joi.string()
      .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
      .required()
      .messages({
        'string.pattern.base': 'New password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.',
      }),
  }),
};

// Middleware to validate Joi schema
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// Routes
router.post('/register', validate(schemas.register), userController.register);
router.post('/login', validate(schemas.login), userController.login);
router.post('/refresh-token', userController.refreshToken);
router.post('/forget-password', validate(schemas.forgetPassword), userController.forgetPassword);
router.post('/reset-password', validate(schemas.resetPassword), userController.resetPassword);
router.get('/me', authenticateToken, userController.getCurrentUser);

// Google OAuth route
router.post('/auth/google', googleAuthController.googleAuth);

module.exports = router;
