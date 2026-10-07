import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Guards pages that need a session. While the stored token is being verified
 * we render a spinner rather than bouncing a logged-in user to /login.
 */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="container py-5 text-center text-muted">
        <Loader2 size={28} className="spin mb-3" />
        <p className="mb-0 small">Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
