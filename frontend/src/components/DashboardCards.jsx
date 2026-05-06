import { DollarSign, ShoppingBag, Users, AlertCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, trend, trendUp, iconBg, textGradient, delay }) {
  return (
    <div 
      className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center justify-between transform hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div>
        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-2">{label}</p>
        <p className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r ${textGradient}`}>
          {value}
        </p>
        {trend && (
          <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );
}

export default function DashboardCards({ stats }) {
  if (!stats) return null;

  // Assuming `stats.low_stock` is provided from backend, or we mock it for now if zero
  const lowStock = stats.low_stock || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        icon={DollarSign} 
        label="Total Revenue" 
        value={`₹${stats.total_revenue?.toLocaleString() || 0}`} 
        trend="+14.5% vs last month"
        trendUp={true}
        iconBg="bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/30"
        textGradient="from-green-700 to-emerald-600"
        delay={0} 
      />
      <StatCard 
        icon={ShoppingBag} 
        label="Total Orders" 
        value={stats.total_orders || 0} 
        trend="+8.2% vs last month"
        trendUp={true}
        iconBg="bg-gradient-to-br from-blue-400 to-indigo-600 shadow-blue-500/30" 
        textGradient="from-gray-800 to-gray-600"
        delay={0.1} 
      />
      <StatCard 
        icon={Users} 
        label="Total Users" 
        value={stats.total_users || 0} 
        trend="+24% new users"
        trendUp={true}
        iconBg="bg-gradient-to-br from-purple-400 to-fuchsia-600 shadow-purple-500/30" 
        textGradient="from-gray-800 to-gray-600"
        delay={0.2} 
      />
      <StatCard 
        icon={AlertCircle} 
        label="Low Stock Products" 
        value={lowStock} 
        trend="Requires action"
        trendUp={false}
        iconBg="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30" 
        textGradient="from-amber-600 to-orange-500"
        delay={0.3} 
      />
    </div>
  );
}
