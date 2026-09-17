import React, { useEffect, useState } from 'react';

export default function VettingQueue() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/vetting', { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNgos(data);
        else console.error('Expected array, got:', data);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/admin/vetting/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` }
      });
      if (res.ok) {
        setNgos(ngos.filter(ngo => ngo._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">NGO Vetting Queue</h1>
          <p className="text-gray-400">Review and approve non-profit organizations requesting access to the platform.</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : ngos.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center backdrop-blur-sm">
            <span className="text-4xl block mb-4">🏆</span>
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-400">No NGOs are currently pending approval.</p>
          </div>
        ) : (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="p-5 font-semibold">Organization</th>
                    <th className="p-5 font-semibold">Contact Email</th>
                    <th className="p-5 font-semibold">Service Area</th>
                    <th className="p-5 font-semibold">Registered On</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {ngos.map(ngo => (
                    <tr key={ngo._id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="p-5 font-medium text-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-inner">
                          {ngo.name.charAt(0).toUpperCase()}
                        </div>
                        {ngo.name}
                      </td>
                      <td className="p-5 text-gray-400">{ngo.email}</td>
                      <td className="p-5 text-gray-400"><span className="bg-gray-800 px-2.5 py-1 rounded-md text-xs border border-gray-700">{ngo.area || 'N/A'}</span></td>
                      <td className="p-5 text-gray-400">{new Date(ngo.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="p-5 flex justify-end gap-3">
                        <button onClick={() => handleAction(ngo._id, 'reject')} className="px-4 py-2 border border-red-500/30 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-medium">
                          Reject
                        </button>
                        <button onClick={() => handleAction(ngo._id, 'approve')} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow shadow-teal-500/20 rounded-lg hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all text-sm font-medium">
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
