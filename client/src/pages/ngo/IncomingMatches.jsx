import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function IncomingMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data } = await api.get('/matches/mine');
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-white mb-6">Incoming Matches</h2>
      
      {matches.length === 0 ? (
        <p className="text-gray-400">No matches found for your requirements yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match._id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded bg-gray-700 text-gray-300 uppercase`}>
                  {match.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-400">{new Date(match.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 mb-2"><span className="font-semibold text-white">Donor ID:</span> {match.donorId}</p>
              {match.conditionOnReceipt && (
                <p className="text-gray-400 text-sm mb-2"><span className="font-semibold text-gray-300">Condition reported:</span> {match.conditionOnReceipt}</p>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                <button 
                  onClick={() => navigate('/ngo/usage-update', { state: { match } })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
                >
                  Manage / Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
