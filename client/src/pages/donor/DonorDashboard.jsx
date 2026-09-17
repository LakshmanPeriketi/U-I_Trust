import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthToken = () => {
    const stored = localStorage.getItem('uandi_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token) return parsed.token;
      } catch {}
    }
    return localStorage.getItem('token') || '';
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const [donRes, matchRes] = await Promise.all([
        fetch('/api/donations/mine', { headers }),
        fetch('/api/matches/mine', { headers }),
      ]);

      const donData = await donRes.json();
      const matchData = await matchRes.json();

      setDonations(Array.isArray(donData) ? donData : []);
      setMatches(Array.isArray(matchData) ? matchData : []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalListed = donations.filter((d) => d.status === 'listed' || d.status === 'available').length;
  const activeMatches = matches.filter((m) => m.status !== 'completed' && m.status !== 'rejected').length;
  const completedDonations = donations.filter((d) => d.status === 'completed').length + matches.filter((m) => m.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Donor'}! 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Thank you for supporting community welfare. Track your listings, pledge items, and chat with partner NGOs.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/donor/create-listing"
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            + Create Listing
          </Link>
          <Link
            to="/donor/requirement-board"
            className="text-xs font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
          >
            Browse NGO Needs
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-700/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Listings</span>
            <span className="text-blue-400 text-lg">📦</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{totalListed}</div>
          <p className="text-xs text-gray-500 mt-1">Ready to be matched</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Matches</span>
            <span className="text-yellow-400 text-lg">🤝</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{activeMatches}</div>
          <p className="text-xs text-gray-500 mt-1">In progress with NGOs</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Donations</span>
            <span className="text-green-400 text-lg">✅</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{completedDonations}</div>
          <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
        </div>
      </div>

      {/* Main Content Grid: Recent Inventory & Active Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inventory */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <h2 className="text-base font-bold text-white">Recent Listings</h2>
            <Link to="/donor/my-donations" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View All ({donations.length}) &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-6 text-center text-gray-500 text-xs">Loading items...</div>
          ) : donations.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No donation listings created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 4).map((d) => (
                <div
                  key={d._id}
                  className="bg-gray-900 border border-gray-700/80 rounded p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white text-sm block">{d.itemType}</span>
                    <span className="text-gray-400">
                      Qty: {d.quantity} · Condition: <span className="capitalize text-gray-300">{d.condition}</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-300 uppercase font-semibold text-[10px]">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Matches Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <h2 className="text-base font-bold text-white">Active Handover Tracker</h2>
            <Link to="/donor/match-status" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Tracker Board &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-6 text-center text-gray-500 text-xs">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No matches initiated yet. Browse open NGO needs to start a pledge!
            </div>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 4).map((m) => (
                <div
                  key={m._id}
                  className="bg-gray-900 border border-gray-700/80 rounded p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white text-sm block">
                      {m.donationId ? m.donationId.itemType : 'Donation Match'}
                    </span>
                    <span className="text-gray-400">
                      Partner NGO: <span className="text-blue-300">{m.ngoId?.name || 'NGO'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/donor/chat/${m._id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 border border-blue-900/60 px-2 py-1 rounded bg-blue-950/40"
                    >
                      💬 Chat
                    </Link>
                    <span className="px-2 py-1 rounded border border-gray-700 bg-gray-800 text-gray-200 capitalize font-medium text-[11px]">
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

