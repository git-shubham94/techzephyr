import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/authService';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Navbar from './components/Navbar';
import AccessibilityPanel from './components/AccessibilityPanel';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import SearchPage from './pages/SearchPage';
import ProjectsPage from './pages/ProjectsPage';
import BookingPage from './pages/BookingPage';
import './App.css';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AccessibilityProvider>
      <div className="app">
        <Navbar />
        <AccessibilityPanel />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <PrivateRoute>
                  <SkillsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <SearchPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <ProjectsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <PrivateRoute>
                  <BookingPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AccessibilityProvider>
  );
}

export default App;
