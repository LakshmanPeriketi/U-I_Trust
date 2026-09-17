import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MATCH_STEPS = [
  { key: 'pending_quota_check', label: 'Quota Check' },
  { key: 'confirmed',           label: 'Confirmed' },
  { key: 'handover_scheduled',  label: 'Handover Scheduled' },
  { key: 'received',            label: 'Received' },
  { key: 'completed',           label: 'Completed' },
];

export default function MatchStatus() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Rating state
  const [ratingInput, setRatingInput] = useState(5);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

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

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/matches/mine', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch match status');
      }
      const list = Array.isArray(data) ? data : [];
      setMatches(list);
      if (list.length > 0 && !selectedMatch) {
        setSelectedMatch(list[0]);
      } else if (selectedMatch) {
        const updatedSel = list.find((m) => m._id === selectedMatch._id);
        if (updatedSel) setSelectedMatch(updatedSel);
      }
    } catch (err) {
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRateNgo = async (matchId) => {
    setRatingSubmitting(true);
    setRatingMessage('');
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/matches/${matchId}/rate-ngo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ rating: ratingInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit rating');
      }
      setRatingMessage('Thank you! NGO rating submitted successfully.');
      fetchMatches();
    } catch (err) {
      setRatingMessage(`Error: ${err.message}`);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending_quota_check': return 0;
      case 'confirmed':           return 1;
      case 'handover_scheduled':  return 2;
      case 'in_transit':          return 2;
      case 'received':            return 3;
      case 'completed':           return 4;
      default:                    return -1;
    }
  };

  const statusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
      case 'handover_scheduled':
      case 'in_transit':
        return 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50';
      case 'received':
        return 'bg-teal-900/60 text-teal-300 border-teal-700/50';
      case 'completed':
        return 'bg-green-900/60 text-green-300 border-green-700/50';
      case 'rejected':
        return 'bg-red-900/60 text-red-300 border-red-700/50';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Match Status & Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">Track donation handovers, NGO impact updates, and direct messaging.</p>
        </div>
        <button
          onClick={fetchMatches}
          className="text-xs text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
        >
          🔄 Refresh Status
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="bg-gray-800/60 border border-gray-700/60 rounded-lg p-10 text-center">
          <p className="text-gray-300 font-medium mb-1">No active matches found.</p>
          <p className="text-xs text-gray-500 mb-4">Pledge an item to an NGO requirement to start tracking.</p>
          <Link
            to="/donor/requirement-board"
            className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Browse Requirement Board
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match List Sidebar */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Active Matches</h2>
            {matches.map((m) => {
              const active = selectedMatch && selectedMatch._id === m._id;
              return (
                <div
                  key={m._id}
                  onClick={() => setSelectedMatch(m)}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    active
                      ? 'bg-gray-800 border-blue-500 shadow-md'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white text-sm">
                      {m.donationId ? m.donationId.itemType : 'Donated Item'}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${statusBadgeColor(m.status)}`}>
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* PRIVACY AUDIT: Render ONLY name + area + rating */}
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>
                      <span className="text-gray-500">NGO Partner:</span>{' '}
                      <span className="text-gray-200 font-medium">{m.ngoId ? m.ngoId.name : 'NGO'}</span>
                    </div>
                    {m.ngoId && m.ngoId.area && (
                      <div>
                        <span className="text-gray-500">Area:</span>{' '}
                        <span className="text-gray-300">{m.ngoId.area}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Match Detail View */}
          {selectedMatch && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
                {/* Detail Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-700 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedMatch.donationId ? selectedMatch.donationId.itemType : 'Matched Item'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Match ID: <span className="font-mono">{selectedMatch._id}</span>
                    </p>
                  </div>
                  <Link
                    to={`/donor/chat/${selectedMatch._id}`}
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                  >
                    💬 Open Chat with NGO
                  </Link>
                </div>

                {/* Counterparty NGO Box — PRIVACY AUDIT ENFORCED */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">NGO Partner Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Organization Name</span>
                      <span className="text-white font-semibold text-sm">{selectedMatch.ngoId?.name || 'NGO Partner'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Service Area</span>
                      <span className="text-gray-300">{selectedMatch.ngoId?.area || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">NGO Rating</span>
                      <span className="text-yellow-400 font-semibold">
                        {selectedMatch.ngoId?.rating ? `★ ${selectedMatch.ngoId.rating} / 5` : 'No ratings yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Tracker */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Handover Progress</h4>
                  {selectedMatch.status === 'rejected' ? (
                    <div className="p-4 bg-red-900/40 border border-red-700 rounded text-red-200 text-sm">
                      ⚠️ This match was rejected due to NGO quota limits. You may pledge this item to another NGO.
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-between">
                      {MATCH_STEPS.map((step, idx) => {
                        const currentIdx = getStepIndex(selectedMatch.status);
                        const isCompleted = currentIdx >= idx;
                        const isCurrent = currentIdx === idx;

                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center text-center relative z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                                isCompleted
                                  ? 'bg-green-600 text-white border border-green-400'
                                  : isCurrent
                                  ? 'bg-blue-600 text-white ring-4 ring-blue-900/50'
                                  : 'bg-gray-900 text-gray-500 border border-gray-700'
                              }`}
                            >
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-medium leading-tight max-w-[80px] ${
                                isCompleted ? 'text-green-300' : isCurrent ? 'text-blue-300' : 'text-gray-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Usage Updates Feed posted by NGO */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    NGO Impact & Usage Updates
                  </h4>
                  {selectedMatch.usageUpdates && selectedMatch.usageUpdates.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMatch.usageUpdates.map((update, idx) => (
                        <div key={idx} className="bg-gray-900 border border-gray-700/80 rounded p-3 text-xs text-gray-200">
                          <span className="text-blue-400 font-semibold mr-2">Update #{idx + 1}:</span>
                          {update}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No usage updates posted by NGO yet.</p>
                  )}
                </div>

                {/* Rate NGO Section */}
                {(selectedMatch.status === 'received' || selectedMatch.status === 'completed') && (
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Rate NGO Experience</h4>
                    {selectedMatch.ngoRating ? (
                      <div className="text-xs font-medium space-y-1">
                        <div className="text-green-400">
                          ✓ You rated this NGO <span className="font-bold">{selectedMatch.ngoRating} ★</span>
                        </div>
                        {selectedMatch.donorRating && (
                          <div className="text-blue-400 mt-1">
                            🌟 The NGO rated you <span className="font-bold">{selectedMatch.donorRating} ★</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-900 border border-gray-700 rounded p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-300 font-medium">Select Rating:</span>
                          <div className="flex gap-1 text-lg cursor-pointer">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingInput(star)}
                                className={star <= ratingInput ? 'text-yellow-400' : 'text-gray-600'}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400 font-bold">{ratingInput} Stars</span>
                        </div>

                        {ratingMessage && (
                          <div className="text-xs text-blue-400 font-medium">{ratingMessage}</div>
                        )}

                        <button
                          onClick={() => handleRateNgo(selectedMatch._id)}
                          disabled={ratingSubmitting}
                          className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors disabled:opacity-50"
                        >
                          {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

