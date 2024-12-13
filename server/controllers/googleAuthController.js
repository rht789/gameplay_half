const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email,
        username: name,
        googleId,
        password: null // Google users don't need password
      });
    } else {
      // Update existing user's googleId if not set
      if (!user.googleId) {
        await user.update({ googleId });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.userID,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.userID,
          email: user.email,
          username: user.username
        }
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
}; 