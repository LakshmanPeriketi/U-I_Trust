import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_LINKS = {
  donor: [
    { to: '/donor/dashboard',         label: 'Dashboard' },
    { to: '/donor/create-listing',    label: 'Create Listing' },
    { to: '/donor/my-donations',      label: 'My Donations' },
    { to: '/donor/requirement-board', label: 'NGO Needs' },
    { to: '/donor/match-status',      label: 'Matches' },
  ],
  ngo: [
    { to: '/ngo/dashboard',        label: 'Dashboard' },
    { to: '/ngo/post-requirement', label: 'Post Requirement' },
    { to: '/ngo/my-requirements',  label: 'My Requirements' },
    { to: '/ngo/quota-status',     label: 'Quota' },
    { to: '/ngo/incoming-matches', label: 'Matches' },
  ],
  admin: [
    { to: '/admin/dashboard',  label: 'Dashboard' },
    { to: '/admin/vetting',    label: 'Vetting' },
    { to: '/admin/users',      label: 'Users' },
    { to: '/admin/disputes',   label: 'Disputes' },
    { to: '/admin/quotas',     label: 'Quotas' },
    { to: '/admin/analytics',  label: 'Analytics' },
  ],
};

export default function Navbar() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const { pathname }      = useLocation();
  const [open, setOpen]   = useState(false);  // mobile menu
  const links             = (user && NAV_LINKS[user.role]) || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleBadgeColor = {
    donor: 'bg-blue-900 text-blue-300',
    ngo:   'bg-green-900 text-green-300',
    admin: 'bg-yellow-900 text-yellow-300',
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-12">

        {/* Brand */}
        <Link to={user ? `/${user.role}/dashboard` : '/login'} className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-base text-white tracking-tight">U&amp;I Trust</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1 ml-6 flex-1">
          {links.map(({ to, label }) => {
            const active = pathname === to || pathname.startsWith(to + '/');
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Role badge */}
              <span className={`hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${roleBadgeColor[user.role] || 'bg-gray-700 text-gray-300'}`}>
                {user.role}
              </span>
              {/* User name */}
              <span className="hidden sm:inline text-xs text-gray-400 max-w-[120px] truncate">
                {user.name}
              </span>
              {/* Logout */}
              <button
                id="btn-navbar-logout"
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" id="btn-navbar-login" className="text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded transition-colors">
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            id="btn-navbar-mobile-menu"
            className="md:hidden text-gray-400 hover:text-white p-1"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && links.length > 0 && (
        <div className="md:hidden border-t border-gray-800 py-2">
          {links.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  active ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
