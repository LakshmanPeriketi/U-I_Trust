import React, { useEffect, useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else console.error('Expected array, got:', data);
      })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatusAction = async (id, action) => {
    if (!window.confirm(action === 'suspend' ? 'Suspend this user account?' : 'Restore this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('uandi_user') || '{}')?.token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === id ? updated : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh] text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
      Loading members...
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Member Directory</h1>
          <p className="text-gray-400 text-sm">Manage user roles, platform access, and suspensions across the system.</p>
        </header>

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="p-5 font-semibold">User</th>
                  <th className="p-5 font-semibold">Contact Email</th>
                  <th className="p-5 font-semibold">Role</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="p-5 text-gray-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name || 'Unknown'}</span>
                    </td>
                    <td className="p-5 text-gray-400 text-sm">{user.email}</td>
                    <td className="p-5">
                      <span className="bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-300 border border-gray-700 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1.5 border ${
                        user.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        user.status === 'verified'  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                           user.status === 'suspended' ? 'bg-red-400' : 
                           user.status === 'verified'  ? 'bg-emerald-400' : 'bg-yellow-500'
                        }`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-5 flex justify-end">
                      {user.role !== 'admin' && user.status !== 'suspended' && (
                        <button 
                          onClick={() => handleStatusAction(user._id, 'suspend')} 
                          className="px-4 py-1.5 text-xs font-semibold text-red-400 bg-transparent border border-red-500/30 rounded focus:outline-none hover:bg-red-500/10 hover:border-red-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                        >
                          Suspend Account
                        </button>
                      )}
                      
                      {user.status === 'suspended' && (
                         <div className="flex items-center gap-3">
                           <span className="text-gray-600 text-xs italic opacity-70">Access Revoked</span>
                           <button 
                             onClick={() => handleStatusAction(user._id, 'restore')} 
                             className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-transparent border border-emerald-500/30 rounded focus:outline-none hover:bg-emerald-500/10 hover:border-emerald-400 transition-all opacity-0 group-hover:opacity-100"
                           >
                             Restore
                           </button>
                         </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
