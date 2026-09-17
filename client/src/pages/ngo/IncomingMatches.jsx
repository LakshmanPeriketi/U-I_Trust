import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useNavigate, Link } from 'react-router-dom';

export default function IncomingMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/matches/mine');
      setMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } fontally: {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Pledged by Donor', color: 'bg-blue-900/60 text-blue-300 border-blue-700' };
      case 'handover_scheduled':
      case 'in_transit':
        return { label: 'In Transit / Pickup', color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' };
      case 'received':
        return { label: 'Received — Needs Update', color: 'bg-purple-900/60 text-purple-300 border-purple-700' };
      case 'completed':
        return { label: 'Completed & Impacted', color: 'bg-green-900/60 text-green-300 border-green-700' };
      case 'rejected':
      case 'disputed':
        return { label: status.toUpperCase(), color: 'bg-red-900/60 text-red-300 border-red-700' };
      default:
        return { label: status.replace(/_/g, ' '), color: 'bg-gray-800 text-gray-300 border-gray-700' };
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['confirmed', 'handover_scheduled', 'in_transit'].includes(m.status);
    if (activeFilter === 'received') return m.status === 'received';
    if (activeFilter === 'completed') return m.status === 'completed';
    return true;
  });

  if (loading) {
    return <div className="text-white text-center mt-12 text-sm">Loading incoming matches...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Incoming Matches & Pledges</h1>
          <p className="text-sm text-gray-400 mt-1">
            Donation offers pledged by donors for your NGO requirements.
          </p>
        </div>
        <button
          onClick={fetchMatches}
          className="text-xs text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-3">
        {[
          { key: 'all', label: `All Matches (${matches.length})` },
          {
            key: 'active',
            label: `Pledged / In Transit (${matches.filter((m) => ['confirmed', 'handover_scheduled', 'in_transit'].includes(m.status)).length})`,
          },
          {
            key: 'received',
            label: `Pending Impact Update (${matches.filter((m) => m.status === 'received').length})`,
          },
          {
            key: 'completed',
            label: `Completed (${matches.filter((m) => m.status === 'completed').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
              activeFilter === tab.key
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-10 text-center">
          <p className="text-gray-300 font-medium mb-1">No matches found in this view.</p>
          <p className="text-xs text-gray-500 mb-4">Post a requirement so donors can pledge matching items to your NGO.</p>
          <Link
            to="/ngo/post-requirement"
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
            Post a Requirement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map((match) => {
            const badge = getStatusBadge(match.status);
            const donorName = match.donorId?.name || (typeof match.donorId === 'string' ? match.donorId : 'Anonymous Donor');
            const donorArea = match.donorId?.area;
            const donorRating = match.donorId?.rating;

            const itemName = match.donationId?.itemType || match.requirementId?.itemType || 'Donated Item';
            const quantity = match.donationId?.quantity || 1;
            const condition = match.donationId?.condition;
            const reqTitle = match.requirementId?.itemType;
            const beneficiary = match.requirementId?.beneficiaryGroup;

            return (
              <div
                key={match._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col justify-between shadow-lg hover:border-gray-600 transition"
              >
                <div>
                  {/* Top Bar: Status + Date */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Main Item Info */}
                  <h3 className="text-lg font-bold text-white mb-1 capitalize">{itemName}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded font-medium">
                      Qty: {quantity}
                    </span>
                    {condition && (
                      <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded capitalize">
                        Condition: {condition}
                      </span>
                    )}
                  </div>

                  {/* Donor Info Box */}
                  <div className="bg-gray-900/80 border border-gray-750 p-3 rounded-md mb-4 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Donor Name:</span>
                      <span className="font-semibold text-white">{donorName}</span>
                    </div>
                    {donorArea && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Donor Area:</span>
                        <span className="text-gray-300">{donorArea}</span>
                      </div>
                    )}
                    {donorRating && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Donor Rating:</span>
                        <span className="text-yellow-400 font-semibold">★ {donorRating} / 5</span>
                      </div>
                    )}
                  </div>

                  {/* Requirement Details if linked */}
                  {reqTitle && (
                    <div className="text-xs text-gray-400 mb-4 bg-blue-950/30 border border-blue-900/40 p-2.5 rounded">
                      <span className="text-blue-300 font-semibold block mb-0.5">Matched Requirement:</span>
                      <div className="text-gray-200">{reqTitle}</div>
                      {beneficiary && <div className="text-gray-400 text-[11px]">For: {beneficiary}</div>}
                    </div>
                  )}

                  {/* Condition on receipt / usage updates feed if available */}
                  {match.conditionOnReceipt && (
                    <div className="text-xs bg-gray-900 p-2.5 rounded border border-gray-700 mb-4 text-gray-300">
                      <span className="font-semibold text-gray-200">Receipt condition:</span> {match.conditionOnReceipt}
                    </div>
                  )}

                  {match.usageUpdates && match.usageUpdates.length > 0 && (
                    <div className="text-xs bg-green-950/30 border border-green-900/40 p-2.5 rounded mb-4 text-green-300 space-y-1">
                      <span className="font-semibold block text-green-200">Impact updates:</span>
                      {match.usageUpdates.map((upd, i) => (
                        <div key={i} className="text-green-300">• {upd}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-gray-700 flex flex-wrap gap-2">
                  <Link
                    to={`/donor/chat/${match._id}`}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                  >
                    💬 Chat
                  </Link>

                  <button
                    onClick={() => navigate('/ngo/usage-update', { state: { match } })}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-semibold transition text-center"
                  >
                    {match.status === 'received'
                      ? '✨ Post Impact Update'
                      : match.status === 'completed'
                      ? '⭐ Review Match'
                      : '📦 Manage / Confirm Receipt'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
