// src/pages/HomePage.js

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Container, Card, CardContent } from '@mui/material';
import { Book, BarChart, AccessTime } from '@mui/icons-material';
import Navbar from '../../components/Navbar/Navbar';
import './Home.css';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const [username, setUsername] = useState('User');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.username) {
      setUsername(user.username);
    } else {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUsername(userData.username);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [isAuthenticated, navigate, user]);

  const handleUsernameClick = () => {
    navigate('/profile');
  };

  return (
    <div className="home-container">
      <Navbar />
      <main>
        <section className="welcome-section">
          <Container>
            <h1>Welcome back, 
              <span 
                className="username-highlight" 
                onClick={handleUsernameClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleUsernameClick()}
              >
                {username}
              </span>!
            </h1>
            <p>Ready to challenge yourself with some quizzes?</p>
            <div className="hero-buttons">
              <Button 
                variant="contained" 
                component={Link} 
                to="/dashboard"
                className="action-button dashboard-btn"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                component={Link} 
                to="/create-quiz"
                className="action-button create-quiz-btn"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#7556f0',
                  border: '2px solid #7556f0',
                  '&:hover': {
                    backgroundColor: '#f8f6ff',
                    border: '2px solid #7556f0',
                  }
                }}
              >
                Create Quiz
              </Button>
            </div>
          </Container>
        </section>

        <section className="stats-section">
          <Container>
            <h2>Your Quiz Stats</h2>
            <div className="stats-grid">
              <Card className="stat-card">
                <CardContent>
                  <Book className="stat-icon" />
                  <h3>Quizzes Taken</h3>
                  <p className="stat-value">27</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent>
                  <BarChart className="stat-icon" />
                  <h3>Average Score</h3>
                  <p className="stat-value">82%</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardContent>
                  <AccessTime className="stat-icon" />
                  <h3>Time Spent</h3>
                  <p className="stat-value">5h 23m</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
};

export default Home;
