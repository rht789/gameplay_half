const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const Joi = require('joi');

// Password validation schema
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
    .required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'))
    .required(),
});

// Middleware to validate Joi schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

// Register route
router.post('/register', validate(registerSchema), userController.register);

// Login route
router.post('/login', validate(loginSchema), userController.login);

// Forget password route
router.post('/forget-password', validate(forgetPasswordSchema), userController.forgetPassword);

// Reset password route (token will be passed in query, newPassword in body)
router.post('/reset-password', validate(resetPasswordSchema), userController.resetPassword);

module.exports = router;
