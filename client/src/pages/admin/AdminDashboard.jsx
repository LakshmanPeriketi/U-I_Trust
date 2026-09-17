import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const cards = [
    { to: '/admin/analytics', title: 'Analytics', desc: 'Platform statistics & real-time match rates', gradient: 'from-blue-500 to-cyan-400', shadow: 'hover:shadow-cyan-500/20', icon: '📊' },
    { to: '/admin/vetting', title: 'NGO Vetting', desc: 'Approve or reject pending NGO registrations', gradient: 'from-emerald-500 to-teal-400', shadow: 'hover:shadow-teal-500/20', icon: '🛡️' },
    { to: '/admin/users', title: 'User Management', desc: 'Manage member roles and account suspensions', gradient: 'from-purple-500 to-indigo-400', shadow: 'hover:shadow-purple-500/20', icon: '👥' },
    { to: '/admin/disputes', title: 'Dispute Review', desc: 'Resolve flagged matching and quality complaints', gradient: 'from-rose-500 to-red-400', shadow: 'hover:shadow-rose-500/20', icon: '⚖️' },
    { to: '/admin/quotas', title: 'Quota Settings', desc: 'Configure dynamic monthly thresholds per NGO', gradient: 'from-amber-500 to-orange-400', shadow: 'hover:shadow-amber-500/20', icon: '⚙️' },
  ];

  return (
    <div className="min-h-[calc(100vh-3rem)] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 mb-4 tracking-tight drop-shadow-sm">
            Admin Control Center
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">
            Oversee platform operations, vet incoming organizations, and manage real-time dynamic quotas.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((cf, idx) => (
            <Link 
              key={idx} 
              to={cf.to} 
              className={`group relative bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 p-6 flex flex-col justify-between hover:bg-gray-800/80 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden shadow-lg ${cf.shadow}`}
            >
              {/* Top gradient highlight strip */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cf.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${cf.gradient} shadow-inner bg-opacity-20 pt-1`}>
                    {cf.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors">
                    {cf.title}
                  </h2>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {cf.desc}
                </p>
              </div>
              
              <div className="mt-8 flex items-center text-sm font-semibold text-gray-500 group-hover:text-gray-300 transition-colors">
                <span>Access Module</span>
                <svg className="w-4 h-4 ml-1 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
