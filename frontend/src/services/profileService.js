// src/services/profileService.js

import api from './api';

const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

const updateUserProfile = async (updateData) => {
  const response = await api.put('/users/profile', updateData);
  
  // Update localStorage with new user data
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const updatedUser = { ...currentUser, ...updateData };
  localStorage.setItem('user', JSON.stringify(updatedUser));
  
  return response.data;
};

const uploadAvatar = async (formData) => {
  const response = await api.post('/users/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const changePassword = async (passwordData) => {
  const response = await api.put('/users/profile/password', passwordData);
  return response.data;
};

const updateAvatar = async (data) => {
  const response = await api.put('/users/profile/avatar', data);
  return response.data;
};

const uploadCustomAvatar = async (formData) => {
  const response = await api.post('/users/profile/avatar/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  changePassword,
  updateAvatar,
  uploadCustomAvatar,
};
