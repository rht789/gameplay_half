// src/pages/Auth/ForgotPassword.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import logo from '../../assets/images/logo.png';
import './ForgotPassword.css'; // Ensure correct CSS path

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.forgotPassword(email);
      toast.success('Password reset link has been sent to your email. Please check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Failed to send reset link. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Email address not found.';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to login navigation
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-card">
      <button className="back-button" onClick={handleBackToLogin}>
        ←
      </button>
      <img src={logo} alt="QuizMaster Logo" className="logo" />
      <h2>Forgot Your Password?</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your registered email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="reset-link-btn"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
