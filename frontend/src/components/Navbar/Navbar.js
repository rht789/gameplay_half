// src/components/Navbar/Navbar.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, PersonOutline } from '@mui/icons-material';
import { Play } from 'lucide-react';
import logo from '../../assets/images/logo.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logoutUser();
    setShowDropdown(false);
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo Section */}
        <div 
          onClick={handleLogoClick} 
          className="brand" 
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
        >
          <img src={logo} alt="QuizMaster" className="brand-logo" />
          <span className="brand-text">QuizMaster</span>
        </div>

        {/* Right Section */}
        <div className="nav-items">
          {/* Search Bar */}
          {user && (
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="search"
                placeholder="Search quizzes..."
                className="search-input"
              />
            </div>
          )}

          {user && (
            <Link 
              to="/join-quiz"
              className="join-quiz-btn"
            >
              <Play size={16} />
              Join Quiz
            </Link>
          )}

          {user ? (
            // Logged in state
            <div className="auth-buttons">
              <Link 
                to="/dashboard"
                className="nav-link"
              >
                Dashboard
              </Link>
              <div className="relative">
                <button 
                  onClick={handleProfileClick}
                  className="profile-button"
                >
                  <div className="profile-circle">
                    <PersonOutline className="h-5 w-5" />
                  </div>
                </button>
                {showDropdown && (
                  <div className="profile-dropdown">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Not logged in state
            <div className="auth-buttons">
              <Link 
                to="/login"
                className="nav-link login-button"
              >
                Log In
              </Link>
              <Link 
                to="/register"
                className="signup-button"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
