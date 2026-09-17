import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Wraps routes that require authentication and optionally a specific role.
 * Unauthenticated users → /login (with `from` state for redirect after login).
 * Wrong-role users → their own dashboard.
 *
 * @param {string[]} allowedRoles — role strings that may access these routes
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
}
