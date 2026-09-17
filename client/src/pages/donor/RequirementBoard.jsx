import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RequirementBoard() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  // Pledge modal state
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [pledgeLoading, setPledgeLoading] = useState(false);
  const [pledgeError, setPledgeError] = useState('');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const [reqRes, donRes] = await Promise.all([
        fetch('/api/requirements', { headers }),
        fetch('/api/donations/mine', { headers }),
      ]);

      const reqData = await reqRes.json();
      const donData = await donRes.json();

      setRequirements(Array.isArray(reqData) ? reqData : []);
      setUserDonations(Array.isArray(donData) ? donData.filter((d) => d.status === 'listed' || d.status === 'available') : []);
    } catch (err) {
      setError(err.message || 'Failed to load requirement board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPledgeModal = (reqItem) => {
    setSelectedRequirement(reqItem);
    setSelectedDonationId(userDonations.length > 0 ? userDonations[0]._id : '');
    setPledgeError('');
    setPledgeSuccess(false);
  };

  const closePledgeModal = () => {
    setSelectedRequirement(null);
    setSelectedDonationId('');
    setPledgeError('');
    setPledgeSuccess(false);
  };

  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonationId) {
      setPledgeError('Please select a donation item from your inventory or create a new listing first.');
      return;
    }

    setPledgeError('');
    setPledgeLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          donationId: selectedDonationId,
          requirementId: selectedRequirement._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete pledge');
      }

      setPledgeSuccess(true);
      fetchData(); // Refresh open requirements & donations
    } catch (err) {
      setPledgeError(err.message || 'Failed to pledge item');
    } finally {
      setPledgeLoading(false);
    }
  };

  const urgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high':
        return <span className="bg-red-900/60 text-red-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-700/50 uppercase">High Urgency</span>;
      case 'medium':
        return <span className="bg-yellow-900/60 text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-700/50 uppercase">Medium Urgency</span>;
      case 'low':
        return <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-700/50 uppercase">Low Urgency</span>;
      default:
        return <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">{urgency}</span>;
    }
  };

  const filteredRequirements = requirements.filter((item) => {
    const matchesSearch = item.itemType?.toLowerCase().includes(search.toLowerCase()) ||
                          item.beneficiaryGroup?.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
    const isOpen = item.status === 'open' || !item.status;
    return matchesSearch && matchesUrgency && isOpen;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NGO Requirement Board</h1>
          <p className="text-sm text-gray-400 mt-1">Browse active needs posted by verified NGOs and pledge your donations directly.</p>
        </div>
        <Link
          to="/donor/create-listing"
          className="inline-flex items-center justify-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          + Add New Item to Donate
        </Link>
      </div>

      {/* Controls Bar: Search & Urgency Filter */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search item type or beneficiary group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">Filter Urgency:</span>
          <div className="flex gap-1">
            {['all', 'high', 'medium', 'low'].map((urg) => (
              <button
                key={urg}
                onClick={() => setUrgencyFilter(urg)}
                className={`text-xs font-medium px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
                  urgencyFilter === urg
                    ? 'bg-gray-700 text-white font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                {urg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading NGO requirements...</div>
      ) : filteredRequirements.length === 0 ? (
        <div className="bg-gray-800/60 border border-gray-700/60 rounded-lg p-10 text-center">
          <p className="text-gray-300 font-medium mb-1">No open NGO requirements match your filter.</p>
          <p className="text-xs text-gray-500 mb-4">You can still list your items and wait for NGO requests.</p>
          <Link
            to="/donor/create-listing"
            className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Create a Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequirements.map((reqItem) => (
            <div
              key={reqItem._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col justify-between hover:border-gray-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-white text-base leading-snug">{reqItem.itemType}</h3>
                  {urgencyBadge(reqItem.urgency)}
                </div>

                <div className="space-y-2 text-xs text-gray-300 mb-4">
                  <div className="flex justify-between border-b border-gray-700/40 pb-1">
                    <span className="text-gray-400">Quantity Needed:</span>
                    <span className="font-semibold text-white">{reqItem.quantityNeeded}</span>
                  </div>
                  {reqItem.beneficiaryGroup && (
                    <div className="flex justify-between border-b border-gray-700/40 pb-1">
                      <span className="text-gray-400">Beneficiary Group:</span>
                      <span className="font-medium text-gray-200">{reqItem.beneficiaryGroup}</span>
                    </div>
                  )}
                  {reqItem.ngoId && (
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-400">NGO Partner:</span>
                      <span className="font-medium text-blue-400">{reqItem.ngoId.name || 'Verified NGO'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700/60">
                <button
                  onClick={() => openPledgeModal(reqItem)}
                  className="w-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded transition-colors"
                >
                  Pledge Item to this NGO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pledge Modal */}
      {selectedRequirement && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Pledge Item</h3>
                <p className="text-xs text-gray-400">Match one of your listed items with this requirement.</p>
              </div>
              <button
                onClick={closePledgeModal}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Requirement Summary */}
            <div className="bg-gray-900 border border-gray-700/80 rounded p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Item Needed:</span>
                <span className="font-semibold text-white">{selectedRequirement.itemType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity Needed:</span>
                <span className="font-semibold text-white">{selectedRequirement.quantityNeeded}</span>
              </div>
            </div>

            {/* Error Banner for Quota or invalid selection */}
            {pledgeError && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs font-medium">
                ⚠️ {pledgeError}
              </div>
            )}

            {pledgeSuccess ? (
              <div className="py-4 text-center space-y-3">
                <div className="text-green-400 text-sm font-semibold">
                  ✓ Pledge submitted successfully! Match confirmed.
                </div>
                <button
                  onClick={() => navigate('/donor/match-status')}
                  className="w-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
                >
                  Go to Match Tracker
                </button>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Select Item from Your Inventory
                  </label>

                  {userDonations.length === 0 ? (
                    <div className="text-xs text-yellow-300 bg-yellow-900/30 border border-yellow-700/50 p-3 rounded mb-2">
                      You don't have any available items listed in your inventory yet.
                    </div>
                  ) : (
                    <select
                      value={selectedDonationId}
                      onChange={(e) => setSelectedDonationId(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {userDonations.map((don) => (
                        <option key={don._id} value={don._id}>
                          {don.itemType} ({don.condition} condition, Qty: {don.quantity})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closePledgeModal}
                    className="text-xs font-medium text-gray-300 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  {userDonations.length === 0 ? (
                    <Link
                      to="/donor/create-listing"
                      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                    >
                      Create Listing First
                    </Link>
                  ) : (
                    <button
                      type="submit"
                      disabled={pledgeLoading}
                      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors disabled:opacity-50"
                    >
                      {pledgeLoading ? 'Submitting Pledge...' : 'Confirm Pledge'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

