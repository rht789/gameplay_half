// src/components/Footer/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Container, Grid } from '@mui/material';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <h2>QuizMaster</h2>
            <p>Empowering learning through interactive quizzes.</p>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </Grid>
        </Grid>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
