import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';
import { PREDEFINED_AVATARS, AVATAR_STYLES } from '../../constants/avatars';
import './AvatarSelector.css';

const AvatarSelector = ({ open, onClose, onSelect, currentAvatar }) => {
  const [tab, setTab] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleAvatarSelect = (avatarUrl) => {
    onSelect({ type: 'predefined', url: avatarUrl });
    onClose();
  };

  const handleCustomUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onSelect({ type: 'custom', file });
      onClose();
    }
  };

  const filteredAvatars = PREDEFINED_AVATARS.filter(
    avatar => avatar.style === selectedStyle
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        Choose Avatar
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Predefined Avatars" />
          <Tab label="Upload Custom" />
        </Tabs>

        {tab === 0 ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Tabs 
                value={selectedStyle} 
                onChange={(e, newValue) => setSelectedStyle(newValue)}
                variant="scrollable"
              >
                {AVATAR_STYLES.map(style => (
                  <Tab key={style} label={style} value={style} />
                ))}
              </Tabs>
            </Box>
            <Grid container spacing={2}>
              {filteredAvatars.map((avatar) => (
                <Grid item xs={4} sm={3} md={2} key={avatar.id}>
                  <Avatar
                    src={avatar.url}
                    className={`avatar-option ${currentAvatar === avatar.url ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar.url)}
                    sx={{ width: 80, height: 80, cursor: 'pointer' }}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              size="large"
            >
              Upload Avatar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleCustomUpload}
              />
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supported formats: JPG, PNG, GIF (max 5MB)
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvatarSelector; 