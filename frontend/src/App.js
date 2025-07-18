// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TitlePage from './pages/TitlePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // On mount, check local storage for token (to keep user logged in on refresh)
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // A helper to handle logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/titles/:id" element={<TitlePage token={token} />} />
        <Route path="/login" element={
          token ? <Navigate to="/" replace /> :
                  <LoginPage onLogin={(newToken) => {
                                 setToken(newToken);
                                 localStorage.setItem('authToken', newToken);
                               }} />}
        />
        <Route path="/register" element={
          token ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route path="/profile" element={
          token ? <ProfilePage token={token} /> : <Navigate to="/login" replace />}
        />
        {/* Optionally, a catch-all route to redirect unknown URLs to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;