import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import VettingStatus from '../../components/ngo/VettingStatus.jsx';

export default function NGODashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [matchRes, reqRes] = await Promise.allSettled([
        api.get('/matches/mine'),
        api.get('/requirements/mine'),
      ]);

      if (matchRes.status === 'fulfilled') {
        setMatches(Array.isArray(matchRes.value.data) ? matchRes.value.data : []);
      }
      if (reqRes.status === 'fulfilled') {
        setRequirements(Array.isArray(reqRes.value.data) ? reqRes.value.data : []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const openReqsCount = requirements.filter((r) => r.status === 'open').length;
  const activeMatchesCount = matches.filter((m) =>
    ['confirmed', 'handover_scheduled', 'in_transit', 'received'].includes(m.status)
  ).length;
  const completedMatchesCount = matches.filter((m) => m.status === 'completed').length;
  const ratingDisplay = user?.rating ? `★ ${user.rating} / 5` : 'New NGO';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Pledged by Donor', color: 'bg-blue-900/60 text-blue-300 border-blue-700' };
      case 'handover_scheduled':
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' };
      case 'received':
        return { label: 'Received — Needs Update', color: 'bg-purple-900/60 text-purple-300 border-purple-700' };
      case 'completed':
        return { label: 'Completed', color: 'bg-green-900/60 text-green-300 border-green-700' };
      default:
        return { label: status.replace(/_/g, ' '), color: 'bg-gray-800 text-gray-300 border-gray-700' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NGO Dashboard — {user?.name || 'Organization Overview'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage requirements, incoming donor matches, quotas, and impact updates.
          </p>
        </div>
        <Link
          to="/ngo/post-requirement"
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition shadow"
        >
          ➕ Post New Requirement
        </Link>
      </div>

      <VettingStatus />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block">Open Requests</span>
          <span className="text-2xl font-extrabold text-blue-400 mt-1 block">{loading ? '...' : openReqsCount}</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block">Active Pledges & Matches</span>
          <span className="text-2xl font-extrabold text-yellow-400 mt-1 block">{loading ? '...' : activeMatchesCount}</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block">Fulfilled Impact</span>
          <span className="text-2xl font-extrabold text-green-400 mt-1 block">{loading ? '...' : completedMatchesCount}</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase block">NGO Rating</span>
          <span className="text-2xl font-extrabold text-yellow-300 mt-1 block">{ratingDisplay}</span>
        </div>
      </div>

      {/* Recent Matches Feed Section */}
      <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Incoming Matches & Pledges</h2>
            <p className="text-xs text-gray-400">Recent donation pledges linked to your NGO requirements.</p>
          </div>
          <Link
            to="/ngo/incoming-matches"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            View All ({matches.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/50 rounded border border-gray-700/60">
            <p className="text-gray-300 font-medium text-sm">No incoming matches found yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              When donors pledge items matching your requirements, they will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.slice(0, 5).map((match) => {
              const badge = getStatusBadge(match.status);
              const donorName = match.donorId?.name || (typeof match.donorId === 'string' ? match.donorId : 'Donor');
              const itemName = match.donationId?.itemType || match.requirementId?.itemType || 'Donated Item';
              const quantity = match.donationId?.quantity || 1;

              return (
                <div
                  key={match._id}
                  className="bg-gray-900 border border-gray-750 hover:border-gray-650 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm capitalize">{itemName}</span>
                      <span className="text-xs text-gray-400">({quantity} pcs)</span>
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Donor: <span className="text-gray-200 font-medium">{donorName}</span>
                      {match.donorId?.area && <span> • Area: {match.donorId.area}</span>}
                      {match.donorId?.rating && <span className="text-yellow-400"> • ★ {match.donorId.rating}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/donor/chat/${match._id}`}
                      className="text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded transition"
                    >
                      💬 Chat
                    </Link>
                    <button
                      onClick={() => navigate('/ngo/usage-update', { state: { match } })}
                      className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link to="/ngo/post-requirement" className="p-5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition">
          <h3 className="text-base font-semibold text-white mb-1">Post a Requirement</h3>
          <p className="text-xs text-gray-400">Request items like food, medical supplies, or clothing.</p>
        </Link>
        <Link to="/ngo/my-requirements" className="p-5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition">
          <h3 className="text-base font-semibold text-white mb-1">My Requirements</h3>
          <p className="text-xs text-gray-400">View and manage your open and fulfilled requests.</p>
        </Link>
        <Link to="/ngo/incoming-matches" className="p-5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition">
          <h3 className="text-base font-semibold text-white mb-1">Incoming Matches</h3>
          <p className="text-xs text-gray-400">Review all matched donation pledges from users.</p>
        </Link>
        <Link to="/ngo/quota-status" className="p-5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition">
          <h3 className="text-base font-semibold text-white mb-1">Quota Status</h3>
          <p className="text-xs text-gray-400">Check your active category limits & monthly quota.</p>
        </Link>
      </div>
    </div>
  );
}
