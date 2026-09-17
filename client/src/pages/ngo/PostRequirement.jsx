import React, { useState } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function PostRequirement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemType: '',
    quantityNeeded: 1,
    urgency: 'medium',
    beneficiaryGroup: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user?.status !== 'verified') {
    return (
      <div className="text-center mt-10">
        <h2 className="text-xl text-red-500">Access Denied</h2>
        <p className="text-gray-400">Your account must be verified to post requirements.</p>
        <button onClick={() => navigate('/ngo/dashboard')} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded">Back to Dashboard</button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/requirements', form);
      navigate('/ngo/my-requirements');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post requirement');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-white mb-6">Post a Requirement</h2>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Item Category (e.g., food, medical, clothing)</label>
          <input
            type="text"
            required
            value={form.itemType}
            onChange={(e) => setForm({...form, itemType: e.target.value.toLowerCase()})}
            className="w-full bg-gray-700 rounded border border-gray-600 p-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Quantity Needed</label>
          <input
            type="number"
            min="1"
            required
            value={form.quantityNeeded}
            onChange={(e) => setForm({...form, quantityNeeded: parseInt(e.target.value)})}
            className="w-full bg-gray-700 rounded border border-gray-600 p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Urgency</label>
          <select
            value={form.urgency}
            onChange={(e) => setForm({...form, urgency: e.target.value})}
            className="w-full bg-gray-700 rounded border border-gray-600 p-2 text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Beneficiary Group (e.g., orphanages, elderly)</label>
          <input
            type="text"
            required
            value={form.beneficiaryGroup}
            onChange={(e) => setForm({...form, beneficiaryGroup: e.target.value})}
            className="w-full bg-gray-700 rounded border border-gray-600 p-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          {loading ? 'Posting...' : 'Post Requirement'}
        </button>
      </form>
    </div>
  );
}
