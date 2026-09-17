import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';

export default function MyRequirements() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const { data } = await api.get('/requirements/mine');
      setRequirements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: 'text-blue-400',
    matched: 'text-yellow-400',
    fulfilled: 'text-green-400',
    closed: 'text-gray-500'
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-white mb-6">My Requirements</h2>
      
      {requirements.length === 0 ? (
        <p className="text-gray-400">You haven't posted any requirements yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 tracking-wider">Item Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 tracking-wider">Beneficiaries</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {requirements.map((req) => (
                <tr key={req._id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{req.itemType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.quantityNeeded}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{req.urgency}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.beneficiaryGroup}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-semibold capitalize ${statusColors[req.status]}`}>
                    {req.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
