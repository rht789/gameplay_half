// src/pages/LandingPage/LandingPage.js

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Container, Card, CardContent } from '@mui/material';
import { Brain, Trophy, Users } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="hero-section">
          <Container>
            <h1>Welcome to QuizMaster</h1>
            <p>Challenge yourself and learn with our interactive quizzes!</p>
            <div className="cta-buttons">
              <button 
                className="get-started-btn"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </Container>
        </section>

        <section className="features-section">
          <Container>
            <h2>Why Choose QuizMaster?</h2>
            <div className="features-grid">
              <Card className="feature-card">
                <CardContent>
                  <Brain size={48} className="feature-icon" />
                  <h3>Learn Anything</h3>
                  <p>Access a wide range of topics and subjects to expand your knowledge.</p>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent>
                  <Trophy size={48} className="feature-icon" />
                  <h3>Compete & Win</h3>
                  <p>Challenge friends and climb the leaderboard to showcase your expertise.</p>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent>
                  <Users size={48} className="feature-icon" />
                  <h3>Community</h3>
                  <p>Join a vibrant community of learners and quiz enthusiasts.</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        <section className="cta-section">
          <Container>
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of learners and start your quiz journey today!</p>
            <Link to="/register">
              <Button variant="contained" className="signup-btn">
                Sign Up Now
              </Button>
            </Link>
          </Container>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
