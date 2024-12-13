// src/pages/Auth/Register.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import logo from '../../assets/images/logo.png';
import './signup.css'; // Ensure correct CSS path
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const { loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    username: '',  // Added username
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(''); // 'weak', 'medium', 'strong', 'very strong'
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Updated password strength checker
  const checkPasswordStrength = (password) => {
    if (/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(password)) {
      return 'strong';
    } else if (/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})/.test(password)) {
      return 'okay';
    } else {
      return 'weak';
    }
  };

  // Function to get password strength message
  const getPasswordStrengthMessage = (strength) => {
    switch (strength) {
      case 'strong':
        return 'Password is Strong';
      case 'okay':
        return 'Password is Okay';
      case 'weak':
        return 'Password is Weak';
      default:
        return '';
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate email
    if (name === 'email') {
      if (validateEmail(value)) {
        setEmailError('');
      } else {
        setEmailError('Please enter a valid email.');
      }
    }

    // Validate password strength
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Validate password match
    if (name === 'confirmPassword') {
      setIsPasswordMatch(value === formData.password);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/v1/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setSuccess(response.data.message || 'Registration successful!');
      
      // Clear form data
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Redirect after 2 seconds so user can see success message

    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 404) {
        setError('Registration endpoint not found. Please check the API route.');
      } else {
        setError(
          err.response?.data?.message || 
          'Registration failed. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error('Google registration failed. Please try again.');
    }
  };

  return (
    <div className="signup-card">
      <img src={logo} alt="QuizMaster Logo" className="logo" />
      <h2>Create your account</h2>

      <div className="google-login-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            toast.error('Google login failed');
          }}
          size="large"
          width="100%"
          text="continue_with"
          shape="rectangular"
        />
      </div>

      <div className="divider">or</div>

      <form onSubmit={handleSubmit}>
        {/* Username input */}
        <input
          type="text"
          name="username"
          placeholder="Enter your Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        {/* Email input */}
        <div className="input-container">
          <input
            type="email"
            name="email"
            placeholder="Enter your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailError && <p className="error-text">{emailError}</p>}
        </div>

        {/* Password input */}
        <div className="password-input-container">
          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {formData.password && (
            <p className={`password-strength-text ${passwordStrength}`}>
              {getPasswordStrengthMessage(passwordStrength)}
            </p>
          )}
        </div>

        {/* Confirm Password input */}
        <div className="password-input-container">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {formData.confirmPassword && (
            <p className="password-match-text">
              {isPasswordMatch ? 
                <span className="match-success">Passwords match</span> : 
                <span className="match-error">Passwords do not match</span>
              }
            </p>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="continue-btn" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Continue'}
        </button>
      </form>

      <p className="signup-prompt">
        Already have an account? <Link to="/login">Log in</Link>
      </p>

      <p className="terms">
        Our <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
      </p>
    </div>
  );
};

export default Register;
