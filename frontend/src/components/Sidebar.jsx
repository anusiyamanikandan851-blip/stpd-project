import { LayoutDashboard, ShoppingBag, Leaf, Users, MessageSquare, Star, BarChart3, Bot, LogOut } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'herbs', label: 'Products', icon: Leaf },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'feedbacks', label: 'Feedback', icon: MessageSquare },
  { id: 'chatbot', label: 'AI Assistant', icon: Bot },
];

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full min-h-[85vh] flex flex-col p-6 sticky top-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-green-500/30">
          <Leaf size={20} />
        </div>
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-emerald-600 tracking-tight">HerbNest</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 text-sm ${
                isActive 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/25 scale-[1.02]' 
                  : 'text-gray-500 hover:bg-green-50/80 hover:text-green-700'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-gray-400"} /> 
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-gray-100 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 text-sm text-rose-500 hover:bg-rose-50"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
