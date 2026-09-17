import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

export default function UsageUpdateForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const match = state?.match;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [condition, setCondition] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [rating, setRating] = useState(5);

  if (!match) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">No match selected.</p>
        <button onClick={() => navigate('/ngo/incoming-matches')} className="text-blue-400 mt-2">Go back</button>
      </div>
    );
  }

  const handleConfirmReceipt = async () => {
    setLoading(true); setError('');
    try {
      // In PRD: handover_scheduled, mapped to in_transit
      await api.patch(`/ngo/match-actions/${match._id}/confirm-receipt`, { conditionOnReceipt: condition });
      navigate('/ngo/incoming-matches'); // Just go back to refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm receipt');
      setLoading(false);
    }
  };

  const handleUsageUpdate = async () => {
    setLoading(true); setError('');
    try {
      await api.post(`/ngo/match-actions/${match._id}/usage-update`, { updateText });
      navigate('/ngo/incoming-matches'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post update');
      setLoading(false);
    }
  };

  const handleRateDonor = async () => {
    setLoading(true); setError('');
    try {
      await api.post(`/ngo/match-actions/${match._id}/rate-donor`, { rating: parseInt(rating) });
      navigate('/ngo/incoming-matches'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rate donor');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-white mb-2">Manage Match</h2>
      <p className="text-xs text-gray-400 mb-6">Match ID: {match._id}</p>
      
      {error && <div className="text-red-500 p-2 bg-red-500/10 rounded mb-4">{error}</div>}

      <div className="space-y-6">
        
        {/* State 1: Confirm Receipt (Only if confirmed, handover_scheduled, or in_transit) */}
        {['confirmed', 'handover_scheduled', 'in_transit'].includes(match.status) && (
          <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
            <h3 className="font-semibold text-white mb-2">Confirm Receipt</h3>
            <input 
              type="text" 
              placeholder="Condition upon receipt (e.g. good, damaged)"
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white mb-3"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
            <button
              onClick={handleConfirmReceipt}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
            >
              Confirm Received
            </button>
          </div>
        )}

        {/* State 2: Usage Update (Only if received) */}
        {match.status === 'received' && (
          <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
            <h3 className="font-semibold text-white mb-2">Post Usage Update</h3>
            <p className="text-xs text-gray-400 mb-2">Tell the donor how you used the items. This marks the match as Completed.</p>
            <textarea 
              placeholder="e.g. Distributed to 50 children today!"
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white mb-3 resize-none h-24"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
            ></textarea>
            <button
              onClick={handleUsageUpdate}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
            >
              Post Update & Complete Match
            </button>
          </div>
        )}

        {/* State 3: Rate Donor (Only if completed and not yet rated) */}
        {match.status === 'completed' && !match.donorRating && (
          <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
            <h3 className="font-semibold text-white mb-2">Rate Donor</h3>
            <select 
              className="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white mb-3"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
            <button
              onClick={handleRateDonor}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded transition"
            >
              Submit Rating
            </button>
          </div>
        )}

        {match.status === 'completed' && match.donorRating && (
          <div className="text-green-500 font-semibold text-center border border-green-500/20 bg-green-500/10 p-4 rounded">
            This match is fully completed and the donor was rated {match.donorRating} stars.
          </div>
        )}
        
      </div>
    </div>
  );
}
