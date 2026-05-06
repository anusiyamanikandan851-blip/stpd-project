import React from 'react';
import { DollarSign, ShoppingBag, Users } from 'lucide-react';

function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <div
      className={`${gradient} p-7 rounded-3xl flex items-center gap-5 shadow-xl text-white transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group animate-fade-in-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-inner flex-shrink-0">
        <Icon size={30} />
      </div>
      <div className="relative z-10">
        <p className="text-white/70 font-bold uppercase tracking-wider text-xs mb-1">{label}</p>
        <p className="text-4xl font-black drop-shadow-sm">{value}</p>
      </div>
    </div>
  );
}

export default function AnalyticsCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard 
        icon={DollarSign} 
        label="Total Revenue" 
        value={`₹${summary.total_revenue}`} 
        gradient="bg-gradient-to-br from-green-500 to-emerald-600" 
      />
      <StatCard 
        icon={ShoppingBag} 
        label="Total Orders" 
        value={summary.total_orders} 
        gradient="bg-gradient-to-br from-blue-500 to-indigo-600" 
        delay={0.1} 
      />
      <StatCard 
        icon={Users} 
        label="Total Users" 
        value={summary.total_users} 
        gradient="bg-gradient-to-br from-purple-500 to-fuchsia-600" 
        delay={0.2} 
      />
    </div>
  );
}
