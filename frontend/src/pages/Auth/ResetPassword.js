// src/pages/Auth/ResetPassword.js

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import logo from '../../assets/images/logo.png';
import './ResetPassword.css'; // Ensure correct CSS path

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');  // 'weak', 'medium', 'strong', 'very-strong'
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');  // Extract the reset token from the URL

  // Password validation function based on the schema used in Signup
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d)(?=.*[a-z]).{8,}$/;
    return passwordRegex.test(password);
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (validatePassword(password)) {
      return 'very-strong';  // Alphanumeric + Symbol + Uppercase + Lowercase
    } else if (/(?=.*[a-zA-Z])(?=.*\d)(?=.{6,})/.test(password)) {
      return 'strong';  // Alphanumeric
    } else if (/(?=.*[a-zA-Z])(?=.{6,})/.test(password)) {
      return 'medium';  // Only alphabets
    } else {
      return 'weak';  // Less than 6 characters
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);

    // Check if password matches confirm password
    if (value === confirmPassword) {
      setIsPasswordMatch(true);
    } else {
      setIsPasswordMatch(false);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value === newPassword) {
      setIsPasswordMatch(true);
    } else {
      setIsPasswordMatch(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Final validations
    if (!validatePassword(newPassword)) {
      toast.error('Password does not meet the strength requirements.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.resetPassword(token, newPassword);
      toast.success(data.message || 'Password successfully updated!');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || 'Invalid or expired token.');
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-card">
      <img src={logo} alt="QuizMaster Logo" className="logo" />
      <h2>Set Your New Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="password-input-wrapper">
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className={`password-strength ${passwordStrength}`}></div>  {/* Password strength indicator */}

        <div className="password-input-wrapper">
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>
        {!isPasswordMatch && <p className="error">Passwords do not match</p>}

        <button type="submit" className="save-password-btn" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save New Password'}
        </button>
        <button type="button" className="return-btn" onClick={() => navigate('/login')}>
          ← Return
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
