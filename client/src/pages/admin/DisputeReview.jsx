import React, { useEffect, useState } from 'react';

export default function DisputeReview() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/disputes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMatches(data);
        else console.error('Expected array, got:', data);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this dispute as resolved and closed?')) return;
    try {
      const res = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        const updated = await res.json();
        setMatches(matches.map(m => m._id === id ? { ...m, ...updated } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh] text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
      Loading match logs...
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Dispute Resolution</h1>
            <p className="text-gray-400 text-sm">Review quality complaints and no-shows between counterparts.</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg">
            <span className="text-rose-400 text-sm font-semibold">Active Disputes: {matches.filter(m => m.status === 'disputed').length}</span>
          </div>
        </header>

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="p-5 font-semibold">Reference ID</th>
                  <th className="p-5 font-semibold">State</th>
                  <th className="p-5 font-semibold">Donor Involved</th>
                  <th className="p-5 font-semibold">NGO Involved</th>
                  <th className="p-5 font-semibold text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {matches.map(m => (
                  <tr key={m._id} className={`hover:bg-gray-800/30 transition-colors group ${m.status === 'disputed' ? 'bg-red-500/5' : ''}`}>
                    <td className="p-5 font-mono text-xs text-gray-500 group-hover:text-gray-400 transition-colors">#{m._id.slice(-8)}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 text-xs rounded font-medium border ${
                        m.status === 'disputed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {m.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-gray-300 text-sm">{m.donorId?.name || <span className="italic text-gray-600">Archived</span>}</td>
                    <td className="p-5 text-gray-300 text-sm">{m.ngoId?.name || <span className="italic text-gray-600">Archived</span>}</td>
                    <td className="p-5 text-right">
                      {m.status === 'disputed' ? (
                        <button 
                          onClick={() => handleResolve(m._id)} 
                          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-lg shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all text-xs font-semibold"
                        >
                          Resolve & Close
                        </button>
                      ) : (
                         <span className="text-gray-600 text-xs font-semibold">No Action Needed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {matches.length === 0 && (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-500">No match records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
