import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import '@/styles/onboarding.css';
import { motion } from 'framer-motion'
import logo from '@/assets/logo.png'

const handleLogoClick = () => {
  window.location.href = '/';
};

export default function Login() {
  useEffect(() => {
    // Create fairy dust effect
    const createFairyDust = () => {
      const container = document.querySelector('.fairy-dust-container');
      if (!container) return;
      const dust = document.createElement('div');
      dust.className = 'fairy-dust';
      dust.style.left = `${Math.random() * 100}%`;
      dust.style.top = `${Math.random() * 100}%`;
      container.appendChild(dust);
      setTimeout(() => {
        dust.remove();
      }, 4000);
    };
    const interval = setInterval(createFairyDust, 200);
    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

  const signInWithGoogle = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
        callback: handleGoogleResponse
      });
      window.google.accounts.id.prompt();
    } else {
      alert('Google Sign-In not loaded. Please try again.');
    }
  };
  
  const handleGoogleResponse = async (response) => {
    try {
      const googleResponse = await fetch(`${API_BASE}/auth/firebase/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      });
      
      const data = await googleResponse.json();
      
      if (googleResponse.ok) {
        localStorage.setItem('lo_token', data.token);
        localStorage.setItem('lo_user_id', data.user.id);
        localStorage.setItem('lo_user_name', data.user.name);
        navigate('/create');
      } else {
        alert(data.error || 'Google login failed');
      }
    } catch (err) {
      alert('Google login error');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE}/auth/email/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('lo_token', data.token);
        localStorage.setItem('lo_user_id', data.user.id);
        localStorage.setItem('lo_user_name', data.user.name);
        navigate('/create');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Connection error: ' + err.message);
    }
  };

  return (
    <div className="auth-page login-page" style={{position: 'relative'}}>
      {/* Golden translucent spheres */}
      {Array.from({length: 5}).map((_, i) => (
        <div
          key={i}
          className="sphere"
          style={{
            position: 'absolute',
            left: `${10 + i * 15}%`,
            top: `${20 + i * 10}%`,
            width: `${180 + i * 40}px`,
            height: `${180 + i * 40}px`,
            zIndex: 0,
            opacity: 0.5,
            filter: 'blur(8px)',
          }}
        />
      ))}
      <div className="fairy-dust-container" style={{position: 'absolute', inset: 0, zIndex: 1}} />
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text)'
        }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <div onClick={handleLogoClick}>
            <img
              src={logo}
              alt="Logo"
              className="h-12 cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            />
          </div>
        </motion.div>
        </div>

      </header>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: window.innerWidth <= 768 ? '1rem' : '2rem'
      }}>
        <div className="auth-container" style={{width: '100%', maxWidth: window.innerWidth <= 768 ? '100%' : '400px'}}>
          <div className="login-form-box">
            <form onSubmit={handleEmailLogin} className="stack">
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Log In</button>
            </form>
            
            <div className="login-footer-links">
              <span style={{color: 'var(--primary)', cursor: 'pointer'}} onClick={() => {
                alert('Please contact support to reset your password.');
              }}>Forgot password?</span>
              <Link to="/signup" style={{fontWeight: '600'}}>Sign up</Link>
            </div>
          </div>

          <div className="login-google-box">
            <button onClick={signInWithGoogle} className="google-login-btn">
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Inline Google G icon to avoid missing-asset issues */}
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path fill="#4285F4" d="M23.64 12.2c0-.78-.07-1.53-.2-2.26H12v4.28h6.32c-.27 1.43-1.02 2.64-2.17 3.45v2.87h3.5c2.05-1.89 3.24-4.68 3.24-8.34z"/>
                  <path fill="#34A853" d="M12 24c2.97 0 5.47-1 7.29-2.73l-3.5-2.87c-.97.65-2.22 1.03-3.79 1.03-2.92 0-5.4-1.97-6.29-4.62H1.99v2.9C3.8 21.9 7.67 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.71 14.81A7.94 7.94 0 0 1 5 12c0-.98.18-1.92.5-2.79V6.31H1.99A11.99 11.99 0 0 0 0 12c0 1.94.43 3.78 1.2 5.41l4.51-2.6z"/>
                  <path fill="#EA4335" d="M12 4.8c1.62 0 3.08.56 4.23 1.66l3.17-3.17C17.45 1.03 14.97 0 12 0 7.67 0 3.8 2.1 1.2 5.61l4.51 2.9C6.6 6.77 9.08 4.8 12 4.8z"/>
                </svg>
              </div>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}