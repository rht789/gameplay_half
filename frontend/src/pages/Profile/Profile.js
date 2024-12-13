// src/pages/Profile/Profile.js

import React, { useState, useEffect } from 'react';
import profileService from '../../services/profileService';
import { toast } from 'react-toastify';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  Avatar,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import { Edit, Close, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import AvatarSelector from '../../components/AvatarSelector/AvatarSelector';
import './ProfileEdit.css';
import { getAvatarUrl } from '../../utils/avatarHelper';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    bio: '',
    location: '',
    avatarUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Dummy data - to be replaced with real data later
  const stats = {
    quizzesTaken: 42,
    quizzesCreated: 15,
    quizzesHosted: 7
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8f9fe',
      borderRadius: '8px'
    }
  };

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getUserProfile();
      setUser(prevUser => ({
        ...prevUser,
        username: data.user.username || '',
        email: data.user.email || '',
        bio: data.user.bio || '',
        location: data.user.location || '',
        avatarUrl: data.user.avatarUrl || ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const handleAvatarSelect = async (selection) => {
    try {
      if (selection.type === 'predefined') {
        const response = await profileService.updateAvatar({ avatarUrl: selection.url });
        setUser(prevUser => ({
          ...prevUser,
          avatarUrl: response.data.avatarUrl
        }));
      } else {
        const formData = new FormData();
        formData.append('avatar', selection.file);
        const response = await profileService.uploadAvatar(formData);
        setUser(prevUser => ({
          ...prevUser,
          avatarUrl: response.data.avatarUrl
        }));
      }
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
  };

  const handleSaveProfile = async () => {
    try {
      await profileService.updateUserProfile({
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      });

      if (user.newPassword && user.newPassword === user.confirmPassword) {
        await profileService.changePassword({
          currentPassword: user.password,
          newPassword: user.newPassword
        });
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('profileUpdated'));

      toast.success('Profile updated successfully');
      handleEditDialogClose();
      fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={getAvatarUrl(user)}
            alt={user.username}
            sx={{ 
              width: 100, 
              height: 100,
              bgcolor: user.avatarUrl ? 'transparent' : 'primary.main'
            }}
          />
          <Box sx={{ 
            ml: 3, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1  // This makes the box take up remaining space
          }}>
            <Box>
              <Typography 
                component="h1"
                variant="h4" 
                sx={{ mb: 1 }}
              >
                {user.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setOpenEditDialog(true)}
              sx={{ 
                color: '#1976d2',
                ml: 2  // Add some margin to separate from text
              }}
            >
              <Edit />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f9fe' }}>
              <Typography component="h3" variant="h6" color="text.secondary">
                Quizzes Taken
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.quizzesTaken}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f0f9f4' }}>
              <Typography variant="h6" color="text.secondary">
                Quizzes Created
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.quizzesCreated}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3f0ff' }}>
              <Typography variant="h6" color="text.secondary">
                Quizzes Hosted
              </Typography>
              <Typography variant="h3" sx={{ color: '#7c4dff' }}>
                {stats.quizzesHosted}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quiz Actions */}
        <Typography 
          component="h2" 
          variant="h6" 
          sx={{ mb: 2, mt: 4 }}
        >
          Quiz Actions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Take Quiz */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                color: '#1976d2',
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                ▶
              </Box>
              <Box>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 500 }}>
                  TAKE QUIZ
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  START A NEW QUIZ FROM OUR COLLECTION
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/join-quiz')}
            >
              Browse Quizzes
            </Button>
          </Box>

          {/* Create Quiz */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                color: '#2e7d32',
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                +
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  CREATE QUIZ
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  DESIGN YOUR OWN QUIZ AND SHARE WITH OTHERS
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/create-quiz')}
            >
              Create New Quiz
            </Button>
          </Box>

          {/* Host Quiz */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                color: '#9c27b0',
                mr: 2,
                display: 'flex',
                alignItems: 'center'
              }}>
                📊
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  HOST QUIZ
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  ORGANIZE A LIVE QUIZ EVENT
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: '#9c27b0',
                '&:hover': {
                  bgcolor: '#7b1fa2'
                }
              }}
              onClick={() => navigate('/quizzes')}
            >
              Start Hosting
            </Button>
          </Box>
        </Box>

        {/* Edit Profile Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={handleEditDialogClose}
          maxWidth="sm"
          fullWidth
          className="profile-edit-dialog"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
            pb: 2
          }}>
            <Typography component="div" variant="h6">Edit Profile</Typography>
            <Box>
              <IconButton onClick={handleSaveProfile} sx={{ mr: 1 }}>
                <Save color="primary" />
              </IconButton>
              <IconButton onClick={handleEditDialogClose}>
                <Close color="error" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 2 }}>
            <Typography component="div" variant="subtitle1" gutterBottom>Name</Typography>
            <TextField
              fullWidth
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="profile-edit-input"
              sx={{ mb: 2 }}
              variant="outlined"
              InputProps={{
                classes: {
                  root: 'profile-edit-input'
                }
              }}
            />

            <Typography component="div" variant="subtitle1" gutterBottom>Email</Typography>
            <TextField
              fullWidth
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="profile-edit-input"
              sx={{ mb: 2 }}
              variant="outlined"
              InputProps={{
                classes: {
                  root: 'profile-edit-input'
                }
              }}
            />

            <Typography component="div" variant="subtitle1" gutterBottom>Avatar</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={getAvatarUrl(user)}
                alt={user.username}
                sx={{ width: 60, height: 60, mr: 2 }}
              />
              <Button
                variant="contained"
                onClick={() => setShowAvatarSelector(true)}
              >
                Change Avatar
              </Button>
            </Box>

            <Typography 
              component="div" 
              variant="subtitle1" 
              gutterBottom 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              🔒 Change Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Enter current password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="profile-edit-input"
              sx={{ mb: 2 }}
              variant="outlined"
              InputProps={{
                classes: {
                  root: 'profile-edit-input'
                }
              }}
            />
            <TextField
              fullWidth
              type="password"
              placeholder="Enter new password"
              value={user.newPassword}
              onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
              className="profile-edit-input"
              sx={{ mb: 2 }}
              variant="outlined"
              InputProps={{
                classes: {
                  root: 'profile-edit-input'
                }
              }}
            />
            <TextField
              fullWidth
              type="password"
              placeholder="Confirm new password"
              value={user.confirmPassword}
              onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
              className="profile-edit-input"
              variant="outlined"
              InputProps={{
                classes: {
                  root: 'profile-edit-input'
                }
              }}
            />
          </DialogContent>
        </Dialog>

        <AvatarSelector
          open={showAvatarSelector}
          onClose={() => setShowAvatarSelector(false)}
          onSelect={handleAvatarSelect}
          currentAvatar={user.avatarUrl}
        />
      </Paper>
    </Container>
  );
};

export default Profile;
