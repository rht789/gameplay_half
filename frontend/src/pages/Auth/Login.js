// src/pages/Auth/Login.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import logo from '../../assets/images/logo.png';
import './login.css';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import api from '../../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      if (response.success) {
        // First set the user in localStorage and update auth headers
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Then update the auth context
        await loginUser(response.data.user);
        
        // Show success message
        toast.success('Login successful!');
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/home');
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.googleAuth(credentialResponse.credential);
      if (response.success) {
        // First set the user in localStorage and update auth headers
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Then update the auth context
        await loginUser(response.data.user);
        
        // Show success message
        toast.success('Login successful!');
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/home');
        }, 100);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="login-card">
      <img src={logo} alt="QuizMaster Logo" className="logo" />
      <h2>Log In to QuizMaster</h2>

      <div className="google-login-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={(error) => {
            console.error('Google Sign In error:', error);
            toast.error('Google login failed. Please try again.');
          }}
          text="Sign in with Google"
          shape="rectangular"
          size="large"
          width="300"
          locale="en"
          useOneTap={false}
          theme="filled_blue"
          cookiePolicy={'single_host_origin'}
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        />
      </div>

      <div className="divider">or</div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Link to="/forgot-password" className="forgot-password-link">
          Forgot Password?
        </Link>
        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="signup-prompt">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
