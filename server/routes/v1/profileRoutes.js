const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { authenticateToken } = require('../../middlewares/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching profile for user:', userId);

    const user = await User.findByPk(userId, {
      attributes: ['userID', 'username', 'email', 'avatarUrl', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.userID,
        username: user.username,
        email: user.email,
        bio: '',
        location: '',
        avatarUrl: user.avatarUrl || '',
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, bio, location, avatarUrl } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      username,
      email,
      bio,
      location,
      avatarUrl
    });

    res.json({
      success: true,
      user: {
        id: user.userID,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        avatarUrl: user.avatarUrl || '',
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Upload avatar
router.post('/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create the full URL for the avatar
    const avatarUrl = `${process.env.API_URL}/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar file if it exists
    if (user.avatarUrl) {
      const oldAvatarPath = user.avatarUrl.split('/').pop();
      const fullPath = path.join(__dirname, '../../uploads/avatars', oldAvatarPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await user.update({ avatarUrl });

    res.json({
      success: true,
      data: {
        avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar'
    });
  }
});

// Add new route for predefined avatar
router.put('/profile/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatarUrl } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ avatarUrl });

    res.json({
      success: true,
      data: {
        avatarUrl
      }
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar'
    });
  }
});

// Keep existing custom upload route
router.post('/profile/avatar/upload', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ avatarUrl });

    res.json({
      success: true,
      data: {
        avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar'
    });
  }
});

module.exports = router; 