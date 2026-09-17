import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = (JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token);
      const res = await fetch('/api/donations/mine', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch donations');
      }
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this donation listing?')) return;
    try {
      const token = (JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token);
      const res = await fetch(`/api/donations/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel donation');
      }
      fetchDonations();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'listed':
      case 'available':
        return <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-700/50">Listed</span>;
      case 'matched':
        return <span className="bg-yellow-900/60 text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-700/50">Matched</span>;
      case 'completed':
        return <span className="bg-green-900/60 text-green-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-700/50">Completed</span>;
      case 'cancelled':
        return <span className="bg-gray-800 text-gray-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-700">Cancelled</span>;
      default:
        return <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded">{status}</span>;
    }
  };

  const filteredDonations = donations.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'listed') return item.status === 'listed' || item.status === 'available';
    return item.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Donation Inventory</h1>
          <p className="text-sm text-gray-400 mt-1">Manage listed items, check match status, and post new donations.</p>
        </div>
        <Link
          to="/donor/create-listing"
          className="inline-flex items-center justify-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          + Create New Listing
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
        {['all', 'listed', 'matched', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs font-medium px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
              filter === tab
                ? 'bg-gray-700 text-white font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading donations...</div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-gray-800/60 border border-gray-700/60 rounded-lg p-10 text-center">
          <p className="text-gray-300 font-medium mb-1">No donations found in this category.</p>
          <p className="text-xs text-gray-500 mb-4">Start by creating a new donation listing for NGOs.</p>
          <Link
            to="/donor/create-listing"
            className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            List an Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDonations.map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col justify-between hover:border-gray-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-white text-base leading-snug">{item.itemType}</h3>
                  {statusBadge(item.status)}
                </div>

                <div className="space-y-1.5 text-xs text-gray-300 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Condition:</span>
                    <span className="capitalize font-medium text-white">{item.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="font-medium text-white">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date Listed:</span>
                    <span className="text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {item.photos && item.photos.length > 0 && item.photos[0] && (
                  <div className="mb-4">
                    <img
                      src={item.photos[0]}
                      alt={item.itemType}
                      className="w-full h-32 object-cover rounded border border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between gap-2">
                {(item.status === 'listed' || item.status === 'available') ? (
                  <>
                    <Link
                      to="/donor/requirement-board"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Pledge to NGO &rarr;
                    </Link>
                    <button
                      onClick={() => handleCancel(item._id)}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/40 px-2.5 py-1 rounded transition-colors"
                    >
                      Cancel Listing
                    </button>
                  </>
                ) : (
                  <Link
                    to="/donor/match-status"
                    className="text-xs font-medium text-gray-300 hover:text-white"
                  >
                    View Match Progress &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

