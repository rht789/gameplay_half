// controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Imported crypto
const { Op } = require('sequelize');
const { User } = require('../models');
const config = require('../config/config'); // Import config.js
const { sendPasswordResetEmail } = require('../utils/email');

// Registration
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword });

    const { userID, createdAt, updatedAt } = newUser;
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: { userID, username, email, createdAt, updatedAt },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { 
        id: user.userID,  // Changed from user.id to user.userID
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.userID,  // Changed from user.id
          email: user.email,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Forget Password
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour

    await user.update({ resetPasswordToken: resetToken, resetPasswordExpires: resetExpires });

    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({ success: true, message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  console.log('Refresh token attempt:', req.body);
  const { refreshToken } = req.body;
  console.log('Refresh token received:', refreshToken); // Debug log

  if (!refreshToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'Refresh token is required' 
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Find user with this refresh token
    const user = await User.findOne({ 
      where: { 
        userID: decoded.id,
        refreshToken 
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user.userID, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
};

// Export getCurrentUser properly
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['userID', 'username', 'email']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.userID,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// Export all functions
module.exports = {
  register: exports.register,
  login: exports.login,
  getCurrentUser: exports.getCurrentUser,
  forgetPassword: exports.forgetPassword,
  resetPassword: exports.resetPassword,
  refreshToken: exports.refreshToken
};
