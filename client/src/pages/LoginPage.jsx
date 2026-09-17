import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login, otpRequest, otpVerify } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState('email');   // 'email' | 'otp'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]       = useState('');
  const [otpCode, setOtpCode]   = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await otpRequest(phone);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await otpVerify(phone, otpCode);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">U&amp;I Trust</h1>
          <p className="mt-1 text-sm text-gray-400">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">

          {/* Tab switcher */}
          <div className="flex mb-6 rounded-md overflow-hidden border border-gray-700">
            <button
              id="tab-email"
              onClick={() => { setTab('email'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'email'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Email / Password
            </button>
            <button
              id="tab-otp"
              onClick={() => { setTab('otp'); setError(''); setOtpSent(false); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'otp'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Phone OTP
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Email/Password form */}
          {tab === 'email' && (
            <form id="form-email-login" onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-xs font-medium text-gray-400 mb-1">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <button
                id="btn-email-login"
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* OTP form */}
          {tab === 'otp' && (
            <form
              id={otpSent ? 'form-otp-verify' : 'form-otp-request'}
              onSubmit={otpSent ? handleOtpVerify : handleOtpRequest}
              className="space-y-4"
            >
              <div>
                <label htmlFor="login-phone" className="block text-xs font-medium text-gray-400 mb-1">
                  Mobile Number
                </label>
                <input
                  id="login-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  disabled={otpSent}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              {otpSent && (
                <div>
                  <label htmlFor="login-otp" className="block text-xs font-medium text-gray-400 mb-1">
                    OTP Code
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Dev stub: use code <code className="text-yellow-400">123456</code></p>
                </div>
              )}
              <button
                id={otpSent ? 'btn-otp-verify' : 'btn-otp-request'}
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded transition-colors"
              >
                {loading ? 'Please wait…' : otpSent ? 'Verify OTP' : 'Send OTP'}
              </button>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); }}
                  className="w-full text-xs text-gray-400 hover:text-white underline"
                >
                  Resend / change number
                </button>
              )}
            </form>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" id="link-goto-signup" className="text-brand-500 hover:text-brand-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
