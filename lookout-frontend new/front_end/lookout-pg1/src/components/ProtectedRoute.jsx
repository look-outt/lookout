import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wraps routes that require a logged-in Firebase user.
 * Shows a blank screen while auth state is loading (avoids flash redirect).
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#000',
          color: '#FFD700',
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.2rem',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
