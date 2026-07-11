import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword } from '../firebase';
import '../styles/onboarding.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const validation = validatePassword(password);

  /* Fairy dust effect */
  useEffect(() => {
    const createFairyDust = () => {
      const container = document.querySelector('.fairy-dust-container');
      if (!container) return;
      const dust = document.createElement('div');
      dust.className = 'fairy-dust';
      dust.style.left = `${Math.random() * 100}%`;
      dust.style.top = `${Math.random() * 100}%`;
      container.appendChild(dust);
      setTimeout(() => dust.remove(), 4000);
    };
    const interval = setInterval(createFairyDust, 200);
    return () => clearInterval(interval);
  }, []);

  const onSignUp = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name');
    const email = fd.get('email');
    const pwd = fd.get('password');
    const confirmPassword = fd.get('confirmPassword');

    if (pwd !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const isValid = validation.length && validation.uppercase && validation.number && validation.special;
    if (!isValid) {
      setError('Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pwd);
      const uid = credential.user.uid;

      // Notify dbserver to create the user row in Neon DB
      await fetch(`${API_BASE}/auth/email/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, name, email }),
      }).catch(() => {});

      navigate('/onboarding');
    } catch (err) {
      setError(err.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await fetch(`${API_BASE}/auth/firebase/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email, name: user.displayName }),
      }).catch(() => {});
      navigate('/onboarding');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message ?? 'Google sign-up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page" style={{ position: 'relative' }}>
      {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="fairy-dust-container" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, display: 'flex', alignItems: 'center', padding: '0 2rem', zIndex: 100 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3">
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="LookOut" className="h-12 transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
          </div>
        </motion.div>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: 360, background: 'rgba(20,20,20,0.95)', borderRadius: 20, boxShadow: '0 8px 32px rgba(255,215,0,0.08)', padding: '2rem 1.5rem' }}>
          <h1 className="title" style={{ textAlign: 'center', color: '#FFD700', fontWeight: 700, fontSize: '2rem', marginBottom: '1.5rem' }}>
            Create account
          </h1>

          {error && (
            <div style={{ color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={onSignUp} className="stack">
            <input className="input" name="name" type="text" placeholder="Full name" required disabled={loading} />
            <input className="input" name="email" type="email" placeholder="Email" required disabled={loading} />
            <input className="input" name="dob" type="date" required disabled={loading} title="Date of birth" />

            {/* Password */}
            <div className="password-field">
              <input
                className="input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️\u200d🗨️'}
              </button>
              <div style={{ color: '#FFD700', fontSize: '0.8rem', marginTop: 4, lineHeight: 1.5 }}>
                Min 8 chars · 1 uppercase · 1 number · 1 special character
              </div>
            </div>

            {/* Confirm password */}
            <div className="password-field">
              <input
                className="input"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                required
                disabled={loading}
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? '👁️' : '👁️\u200d🗨️'}
              </button>
            </div>

            <div className="row" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: '#FFD700', color: '#222', fontWeight: 700, fontSize: '1.1rem', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', cursor: 'pointer', width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Sign up'}
              </button>
            </div>
          </form>

          {/* Google sign-up */}
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={handleGoogleSignup} className="google-login-btn" disabled={loading} style={{ width: '100%' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path fill="#4285F4" d="M23.64 12.2c0-.78-.07-1.53-.2-2.26H12v4.28h6.32c-.27 1.43-1.02 2.64-2.17 3.45v2.87h3.5c2.05-1.89 3.24-4.68 3.24-8.34z"/>
                <path fill="#34A853" d="M12 24c2.97 0 5.47-1 7.29-2.73l-3.5-2.87c-.97.65-2.22 1.03-3.79 1.03-2.92 0-5.4-1.97-6.29-4.62H1.99v2.9C3.8 21.9 7.67 24 12 24z"/>
                <path fill="#FBBC05" d="M5.71 14.81A7.94 7.94 0 0 1 5 12c0-.98.18-1.92.5-2.79V6.31H1.99A11.99 11.99 0 0 0 0 12c0 1.94.43 3.78 1.2 5.41l4.51-2.6z"/>
                <path fill="#EA4335" d="M12 4.8c1.62 0 3.08.56 4.23 1.66l3.17-3.17C17.45 1.03 14.97 0 12 0 7.67 0 3.8 2.1 1.2 5.61l4.51 2.9C6.6 6.77 9.08 4.8 12 4.8z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FFD700', fontWeight: 600 }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
