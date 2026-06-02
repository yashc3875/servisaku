import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { auditLog } from '@/lib/security';

export default function ProtectedRoute({ children, roles }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/otp-login" replace state={{ from: window.location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    auditLog('ACCESS_DENIED', { required: roles, actual: user.role, path: window.location.pathname });
    return <Navigate to="/" replace />;
  }

  return children;
}