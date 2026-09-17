import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function VettingStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    verified: 'bg-green-500/20 text-green-500',
    rejected: 'bg-red-500/20 text-red-500',
    suspended: 'bg-gray-500/20 text-gray-500'
  };

  return (
    <div className={`p-4 rounded-lg flex items-center justify-between ${statusColors[user.status] || 'bg-gray-800 text-white'}`}>
      <div>
        <h3 className="font-semibold text-lg">Account Status: {user.status.charAt(0).toUpperCase() + user.status.slice(1)}</h3>
        {user.status === 'pending' && <p className="text-sm opacity-80">Your vetting documents are under review.</p>}
        {user.status === 'rejected' && <p className="text-sm opacity-80">Your application was rejected. Please re-upload your vetting documents.</p>}
        {user.status === 'suspended' && <p className="text-sm opacity-80">Your account is currently suspended.</p>}
        {user.status === 'verified' && <p className="text-sm opacity-80">Your account is verified. You can post requirements.</p>}
      </div>
      {user.status === 'rejected' && (
        <button 
          onClick={() => navigate('/ngo/register')}
          className="px-4 py-2 bg-red-600 outline-none rounded hover:bg-red-700 text-white transition-colors"
        >
          Re-upload Docs
        </button>
      )}
    </div>
  );
}
