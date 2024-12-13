// src/pages/Dashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Welcome to the Quiz Management System</h1>
      <p>Use the navigation bar to manage quizzes and questions.</p>
      
      <div className="dashboard-actions">
        <Link to="/quizzes" className="dashboard-card">
          <h2>Manage Quizzes</h2>
          <p>Create, edit, and organize your quizzes</p>
        </Link>
        
        <Link to="/questions" className="dashboard-card">
          <h2>Question Bank</h2>
          <p>Manage your question repository</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
