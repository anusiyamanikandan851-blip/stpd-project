import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, X, Package, Tag, Info, CheckCheck } from 'lucide-react';
import API_URL from '../config';

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // Silently fail
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { }
  };

  const typeConfig = {
    order: { bg: 'bg-green-50 border-green-100', icon: Package, iconColor: 'text-green-600', dot: 'bg-green-500' },
    promo: { bg: 'bg-yellow-50 border-yellow-100', icon: Tag, iconColor: 'text-yellow-600', dot: 'bg-yellow-500' },
    info: { bg: 'bg-blue-50 border-blue-100', icon: Info, iconColor: 'text-blue-600', dot: 'bg-blue-500' },
  };

  const getTimeAgo = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!token) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-xl text-green-800 hover:bg-green-50 transition-all hover:text-green-600"
        title="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-96 max-h-[520px] bg-white/95 backdrop-blur-lg border border-gray-100 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-green-700" />
              <span className="font-black text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-green-700 font-bold hover:text-green-900 transition">
                  <CheckCheck size={14} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Bell size={48} strokeWidth={1} className="text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm">You'll see order updates here</p>
              </div>
            ) : (
              notifications.map(n => {
                const config = typeConfig[n.type] || typeConfig.info;
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`mt-0.5 p-2 rounded-xl border ${config.bg} flex-shrink-0`}>
                      <Icon size={16} className={config.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{getTimeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${config.dot}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
