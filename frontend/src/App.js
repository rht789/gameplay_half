// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import QuizList from './pages/Quizzes/QuizList';
import CreateQuiz from './pages/Quizzes/CreateQuiz';
import CreateQuestion from './pages/Questions/CreateQuestion';
import LandingPage from './pages/LandingPage/LandingPage';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import ModeSelection from './pages/Quizzes/ModeSelection';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QuizProvider } from './contexts/QuizContext';
import ErrorBoundary from './components/ErrorBoundary';
import QuestionDisplay from './pages/Questions/QuestionDisplay';
import HostControl from './pages/Host/HostControl';
import JoinQuiz from './pages/Participant/JoinQuiz';
import WaitingRoom from './pages/Participant/WaitingRoom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Profile from './pages/Profile/Profile';
import { SessionProvider } from './contexts/SessionContext';
import QuizHost from './pages/Host/QuizHost';
import QuizParticipant from './pages/Participant/QuizParticipant';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <SessionProvider>
            <QuizProvider>
              <div className="app-container">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
                    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/quizzes" element={<ProtectedRoute><ErrorBoundary><QuizList /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
                    <Route path="/quizzes/:quizId/mode-selection" element={<ProtectedRoute><ModeSelection /></ProtectedRoute>} />
                    <Route path="/quizzes/:quizId/create-question" element={<ProtectedRoute><CreateQuestion /></ProtectedRoute>} />
                    <Route path="/quizzes/:quizId/questions" element={<ProtectedRoute><QuestionDisplay /></ProtectedRoute>} />
                    <Route path="/quizzes/:quizId/questions/:questionId/edit" element={<ProtectedRoute><CreateQuestion /></ProtectedRoute>} />
                    <Route path="/host-control/:sessionId" element={<ProtectedRoute><HostControl /></ProtectedRoute>} />
                    <Route path="/join-quiz" element={<ProtectedRoute><JoinQuiz /></ProtectedRoute>} />
                    <Route path="/waiting-room/:sessionId" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/host/quiz/:sessionId" element={<ProtectedRoute><QuizHost /></ProtectedRoute>} />
                    <Route path="/quiz/:sessionId/participate" element={<ProtectedRoute><QuizParticipant /></ProtectedRoute>} />
                  </Routes>
                </main>
                <Footer />
                <ToastContainer />
              </div>
            </QuizProvider>
          </SessionProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
