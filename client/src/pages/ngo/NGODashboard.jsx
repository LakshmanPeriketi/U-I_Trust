import React from 'react';
import { Link } from 'react-router-dom';
import VettingStatus from '../../components/ngo/VettingStatus.jsx';

export default function NGODashboard() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4">
      <h1 className="text-2xl font-bold text-white mb-2">NGO Dashboard</h1>
      
      <VettingStatus />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link to="/ngo/post-requirement" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-semibold mb-2">Post a Requirement</h2>
          <p className="text-gray-400">Request items like food, medical supplies, or clothing.</p>
        </Link>
        <Link to="/ngo/my-requirements" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-semibold mb-2">My Requirements</h2>
          <p className="text-gray-400">View and manage your open and fulfilled requests.</p>
        </Link>
        <Link to="/ngo/incoming-matches" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-semibold mb-2">Incoming Matches</h2>
          <p className="text-gray-400">Review matching donations from users.</p>
        </Link>
        <Link to="/ngo/quota-status" className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-semibold mb-2">Quota Status</h2>
          <p className="text-gray-400">Check your remaining quota for items.</p>
        </Link>
      </div>
    </div>
  );
}
