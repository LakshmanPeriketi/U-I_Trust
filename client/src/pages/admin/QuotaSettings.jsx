import React, { useEffect, useState } from 'react';

export default function QuotaSettings() {
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState('');
  const [formData, setFormData] = useState({ maxActiveRequests: 5, monthlyLimit: 20, notes: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setNgos(data.filter(u => u.role === 'ngo')); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedNgo) return;
    fetch(`/api/admin/quotas/${selectedNgo}`, { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data._id) {
          setFormData({
            maxActiveRequests: data.maxActiveRequests || 5,
            monthlyLimit: data.monthlyLimit || 20,
            notes: data.notes || ''
          });
        } else {
          setFormData({ maxActiveRequests: 5, monthlyLimit: 20, notes: '' }); // default fallback
        }
      })
      .catch(console.error);
  }, [selectedNgo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNgo) return;
    try {
      const res = await fetch(`/api/admin/quotas/${selectedNgo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage('Network quota thresholds successfully propagated.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="mb-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">⚙️</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Organization Quotas</h1>
          </div>
          <p className="text-gray-400 text-sm pl-11">Configure dynamic capacity limits for individual nonprofits.</p>
        </header>
        
        {message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3 animate-pulse relative z-10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {message}
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Organization</label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 appearance-none transition-all"
                value={selectedNgo} 
                onChange={(e) => setSelectedNgo(e.target.value)}
              >
                <option value="">-- Choose an NGO from the directory --</option>
                {ngos.map(ngo => (
                  <option key={ngo._id} value={ngo._id}>{ngo.name} ({ngo.email})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 ease-in-out ${selectedNgo ? 'opacity-100 max-h-[800px] translate-y-0' : 'opacity-0 max-h-0 -translate-y-4 pointer-events-none overflow-hidden'}`}>
            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Maximum Active Requests</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-bold text-lg"
                    value={formData.maxActiveRequests} 
                    onChange={e => setFormData({ ...formData, maxActiveRequests: parseInt(e.target.value) })}
                  />
                  <p className="text-[10px] text-gray-500 mt-2">Concurrent open listings allowed.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Global Monthly Limit</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white font-mono focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-bold text-lg"
                    value={formData.monthlyLimit} 
                    onChange={e => setFormData({ ...formData, monthlyLimit: parseInt(e.target.value) })}
                  />
                  <p className="text-[10px] text-gray-500 mt-2">Total limit spanning a 30-day window.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Administrative Memos</label>
                <textarea 
                  className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-xl text-gray-300 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all min-h-[100px] text-sm"
                  value={formData.notes} 
                  placeholder="Justify quota shifts for auditing purposes..."
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all text-sm tracking-wide">
                  Enforce Quota Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
