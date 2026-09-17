import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = [
  { value: 'donor', label: 'Donor — I want to donate items' },
  { value: 'ngo',   label: 'NGO — I represent a verified organisation' },
];

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:     '',
    email:    '',
    phone:    '',
    password: '',
    confirm:  '',
    role:     'donor',
    area:     '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const user = await register({
        name:     form.name,
        email:    form.email,
        phone:    form.phone || undefined,
        password: form.password,
        role:     form.role,
        area:     form.area || undefined,
      });
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';
  const labelCls = 'block text-xs font-medium text-gray-400 mb-1';

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">U&amp;I Trust</h1>
          <p className="mt-1 text-sm text-gray-400">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <form id="form-signup" onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <label htmlFor="signup-role" className={labelCls}>I am a</label>
              <select
                id="signup-role"
                value={form.role}
                onChange={handle('role')}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="signup-name" className={labelCls}>Full Name</label>
              <input
                id="signup-name"
                type="text"
                required
                value={form.name}
                onChange={handle('name')}
                placeholder="Jane Doe"
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className={labelCls}>Email</label>
              <input
                id="signup-email"
                type="email"
                required
                value={form.email}
                onChange={handle('email')}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="signup-phone" className={labelCls}>
                Phone <span className="text-gray-600 font-normal">(optional — for OTP login)</span>
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={form.phone}
                onChange={handle('phone')}
                placeholder="+91 9876543210"
                className={inputCls}
              />
            </div>

            {/* Area */}
            <div>
              <label htmlFor="signup-area" className={labelCls}>
                Area / City <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <input
                id="signup-area"
                type="text"
                value={form.area}
                onChange={handle('area')}
                placeholder="Mumbai, Maharashtra"
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className={labelCls}>Password</label>
              <input
                id="signup-password"
                type="password"
                required
                value={form.password}
                onChange={handle('password')}
                placeholder="Min 6 characters"
                className={inputCls}
              />
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="signup-confirm" className={labelCls}>Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                required
                value={form.confirm}
                onChange={handle('confirm')}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            {/* NGO note */}
            {form.role === 'ngo' && (
              <p className="text-xs text-yellow-500 border border-yellow-800 bg-yellow-900/20 rounded px-3 py-2">
                NGO accounts require admin vetting before you can post requirements. You can complete your organisation profile after signup.
              </p>
            )}

            <button
              id="btn-signup-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded transition-colors"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" id="link-goto-login" className="text-brand-500 hover:text-brand-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
