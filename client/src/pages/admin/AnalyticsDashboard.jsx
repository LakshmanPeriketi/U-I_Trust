import React, { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` } })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex justify-center items-center h-[50vh] text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
      Loading platform metrics...
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-600 to-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Verified NGOs', value: stats.verifiedNGOs, color: 'from-emerald-600 to-teal-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Donation Listings', value: stats.totalDonations, color: 'from-purple-600 to-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'Requirements', value: stats.totalRequirements, color: 'from-amber-600 to-orange-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Total Matches', value: stats.totalMatches, color: 'from-pink-600 to-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { label: 'Completed Deliveries', value: stats.completedMatches, color: 'from-green-600 to-lime-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Disputes Flagged', value: stats.disputedMatches, color: 'from-red-600 to-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>📈</span> Analytics Overview
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time aggregate data across all platform endpoints</p>
          </div>
          <button className="mt-4 md:mt-0 px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-2" onClick={() => window.location.reload()}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl ${card.bg} border ${card.border} backdrop-blur-[2px] transition-transform hover:-translate-y-1`}>
              <p className="text-sm font-medium text-gray-400 mb-2">{card.label}</p>
              <p className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${card.color} drop-shadow-sm`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-300 mb-1 z-10 relative">Match Rate</h2>
            <div className="flex items-end mb-4 z-10 relative">
              <span className="text-5xl font-black text-white">{stats.matchRate}%</span>
              <span className="ml-2 mb-1.5 text-gray-500 font-medium">of donations</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-2 z-10 relative shadow-inner">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" style={{ width: `${stats.matchRate}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-300 mb-1 z-10 relative">Fulfillment Rate</h2>
            <div className="flex items-end mb-4 z-10 relative">
              <span className="text-5xl font-black text-white">{stats.fulfillmentRate}%</span>
              <span className="ml-2 mb-1.5 text-gray-500 font-medium">of requirements</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 mb-2 z-10 relative shadow-inner">
              <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-3 rounded-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" style={{ width: `${stats.fulfillmentRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
