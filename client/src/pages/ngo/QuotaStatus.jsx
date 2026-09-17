import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';

export default function QuotaStatus() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORY_LIMITS = {
    default: 10,
    food: 50,
    medical: 20,
    education: 30
  };

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

  const calculateQuota = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const validStatuses = ['confirmed', 'in_transit', 'received', 'completed'];
    
    // Group matches by category (itemType)
    // NOTE: Donor's API for Match might not populate Donation, so itemType might be tricky to get if not populated.
    // For this demonstration, we assume match.donationId is populated or we group by a placeholder if not.
    const usedQuotas = {};

    matches.filter(m => {
      const date = new Date(m.createdAt);
      return date >= sevenDaysAgo && validStatuses.includes(m.status);
    }).forEach(m => {
      const category = m.donationId?.itemType?.toLowerCase() || 'default';
      usedQuotas[category] = (usedQuotas[category] || 0) + 1;
    });

    return Object.keys(CATEGORY_LIMITS).map(cat => ({
      category: cat,
      limit: CATEGORY_LIMITS[cat],
      used: usedQuotas[cat] || 0,
      remaining: Math.max(0, CATEGORY_LIMITS[cat] - (usedQuotas[cat] || 0))
    }));
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

  const quotas = calculateQuota();

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-white mb-2">Rolling 7-Day Quota</h2>
      <p className="text-gray-400 mb-6">Limits on incoming matches to prevent hoarding.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotas.map(q => (
          <div key={q.category} className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white capitalize mb-1">{q.category}</h3>
            <p className="text-gray-400 text-sm mb-4">You have received {q.used} / {q.limit} items</p>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${q.remaining === 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${Math.min((q.used / q.limit) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-500 mt-2">{q.remaining} remaining</p>
          </div>
        ))}
      </div>
    </div>
  );
}
