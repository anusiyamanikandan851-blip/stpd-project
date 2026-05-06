import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Leaf, Trash2, Edit2, Plus, X, MessageSquare, Bot } from 'lucide-react';
import AdminAnalytics from './AdminAnalytics';

// New Components
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards';
import OrdersTable from '../components/OrdersTable';
import TopProducts from '../components/TopProducts';
import SalesChart from '../components/SalesChart';
import StockTable from '../components/StockTable';
import UsersTable from '../components/UsersTable';
import API_URL from '../config';

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('adminTab') || 'overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [herbs, setHerbs] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [isAddingHerb, setIsAddingHerb] = useState(false);
  const [editingHerbId, setEditingHerbId] = useState(null);
  const [herbForm, setHerbForm] = useState({ name: '', description: '', category: 'Herbs', price: '', stock: '', image_url: '' });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    return () => localStorage.removeItem('adminTab');
  }, []);

  useEffect(() => {
    if (!token || user.role !== 'admin') { navigate('/'); return; }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const [sRes, oRes, hRes, uRes] = await Promise.all([
          axios.get(`${API_URL}/admin/dashboard`, { headers: h }),
          axios.get(`${API_URL}/admin/orders`, { headers: h }),
          axios.get(`${API_URL}/admin/herbs`, { headers: h }),
          axios.get(`${API_URL}/admin/users`, { headers: h })
        ]);
        setStats(sRes.data);
        setOrders(oRes.data);
        setHerbs(hRes.data);
        setUsers(uRes.data);
      } else if (activeTab === 'orders') {
        const { data } = await axios.get(`${API_URL}/admin/orders`, { headers: h });
        setOrders(data);
      } else if (activeTab === 'herbs') {
        const { data } = await axios.get(`${API_URL}/admin/herbs`, { headers: h });
        setHerbs(data);
      } else if (activeTab === 'users') {
        const { data } = await axios.get(`${API_URL}/admin/users`, { headers: h });
        setUsers(data);
      } else if (activeTab === 'feedbacks') {
        const { data } = await axios.get(`${API_URL}/admin/feedbacks`, { headers: h });
        setFeedbacks(data);
      } else if (activeTab === 'reviews') {
        const { data } = await axios.get(`${API_URL}/admin/reviews`, { headers: h });
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, newTrackingId, newDeliveryDate) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/status`, { 
        status: newStatus,
        tracking_id: newTrackingId,
        delivery_date: newDeliveryDate 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus, tracking_id: newTrackingId, delivery_date: newDeliveryDate } : o));
    } catch (err) { alert('Failed to update status'); }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await axios.delete(`${API_URL}/admin/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` }});
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) { alert('Failed to delete review'); }
  };

  const saveHerb = async () => {
    try {
      if (editingHerbId) {
        await axios.put(`${API_URL}/admin/herbs/${editingHerbId}`, herbForm, { headers: { Authorization: `Bearer ${token}` }});
        setHerbs(herbs.map(h => h.id === editingHerbId ? { ...h, ...herbForm } : h));
        setEditingHerbId(null);
      } else {
        const { data } = await axios.post(`${API_URL}/admin/herbs`, herbForm, { headers: { Authorization: `Bearer ${token}` }});
        setHerbs([{ id: data.id, ...herbForm }, ...herbs]);
        setIsAddingHerb(false);
      }
      setHerbForm({ name: '', description: '', category: 'Herbs', price: '', stock: '', image_url: '' });
    } catch (err) { alert('Failed to save product'); }
  };

  const deleteHerb = async (herbId) => {
    if(!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/admin/herbs/${herbId}`, { headers: { Authorization: `Bearer ${token}` }});
      setHerbs(herbs.filter(h => h.id !== herbId));
    } catch (err) { alert('Failed to delete product'); }
  };

  const sendAdminMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/admin-chatbot/`, {
        message: chatInput, history: newHistory.slice(0, -1)
      }, { headers: { Authorization: `Bearer ${token}` }});
      setChatHistory([...newHistory, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Connection failed. Ensure API is running.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (user.role !== 'admin') return null;

  return (
    <div className="bg-gray-50/50 min-h-screen font-sans animate-fade-in pb-10">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Component */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Interface */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header Block */}
          <div className="mb-8 pl-2 flex items-center justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, Admin! 👋</h1>
              <p className="text-gray-500 font-medium mt-1">Here’s your store performance overview</p>
            </div>
          </div>

          {/* Loader Overlay */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-green-600 animate-pulse gap-3">
              <Leaf size={40} className="animate-bounce" />
              <span className="font-bold tracking-widest uppercase text-sm">Synchronizing...</span>
            </div>
          ) : (
            <div className="flex-1">
              {/* === OVERVIEW TAB === */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <DashboardCards stats={stats} />
                  
                  {/* Heavy Grid (Charts + Tables) */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                      <SalesChart topProducts={stats.frequently_bought_herbs} revenueTrend={stats.monthly_revenue} />
                      <OrdersTable orders={orders} />
                      
                      <div className="space-y-6 animate-fade-in-up" style={{animationDelay:'0.5s'}}>
                        <h3 className="text-2xl font-black text-gray-800">Stock Details</h3>
                        <StockTable 
                          herbs={herbs} 
                          onEdit={(h) => { setEditingHerbId(h.id); setHerbForm(h); setIsAddingHerb(false); setActiveTab('herbs'); }} 
                          onDelete={deleteHerb} 
                        />
                      </div>
                      
                      <div className="animate-fade-in-up" style={{animationDelay:'0.6s'}}>
                        <UsersTable users={users.slice(0, 10)} />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <TopProducts topProducts={stats.frequently_bought_herbs} />
                      
                      {/* User Activity Side Block */}
                      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col p-6 animate-fade-in-up" style={{animationDelay:'0.4s'}}>
                        <h3 className="text-lg font-black text-gray-800 mb-4">User Activity</h3>
                        <div className="text-sm font-bold text-green-700 bg-green-50/80 p-4 rounded-xl flex items-center justify-between mb-3 border border-green-100">
                          <span>+{Math.floor(stats.total_users * 0.15) || 12} New Users</span>
                          <span className="text-xs text-green-600">This Month</span>
                        </div>
                        <div className="text-sm font-bold text-blue-700 bg-blue-50/80 p-4 rounded-xl flex items-center justify-between border border-blue-100">
                          <span>{orders.length} Total Orders</span>
                          <span className="text-xs text-blue-600">Lifetime</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === ANALYTICS TAB === */}
              {activeTab === 'analytics' && <AdminAnalytics />}

              {/* === ORDERS TAB === */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-fade-in-up">
                  <h3 className="text-2xl font-black text-gray-800">Order Management Tracking</h3>
                  <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="px-6 py-5">Order ID</th><th className="px-6 py-5">Customer</th>
                          <th className="px-6 py-5">Total</th>
                          <th className="px-6 py-5">Live Tracking</th><th className="px-6 py-5">Status Updates</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 font-black text-gray-900">#{o.id}</td>
                            <td className="px-6 py-5">
                              <div className="font-semibold text-gray-800">{o.user}</div>
                              <div className="text-[10px] text-gray-400 font-bold tracking-wider">{o.user_email}</div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {o.items?.map((item, idx) => (
                                  <span key={idx} className="bg-green-50 text-green-700 text-[9px] px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-wider font-bold">
                                    {item.quantity}x {item.herb_name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-5 font-black text-green-700">₹{o.total_price.toFixed(2)}</td>
                            <td className="px-6 py-5 w-1/4">
                              <div className="flex flex-col gap-2">
                                <input type="text" placeholder="Tracking ID" defaultValue={o.tracking_id || ''} 
                                      onBlur={(e) => { if(e.target.value !== (o.tracking_id||'')) updateOrderStatus(o.id, o.order_status, e.target.value, o.delivery_date) }}
                                      className="border rounded-xl px-3 py-2 text-xs font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 w-full transition" />
                                <input type="date" defaultValue={o.delivery_date ? new Date(o.delivery_date).toISOString().split('T')[0] : ''}
                                      onBlur={(e) => { if(e.target.value !== (o.delivery_date?.split('T')[0]||'')) updateOrderStatus(o.id, o.order_status, o.tracking_id, e.target.value) }}
                                      className="border rounded-xl px-3 py-2 text-xs font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-400 w-full transition text-gray-500" />
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <select value={o.order_status} onChange={e => updateOrderStatus(o.id, e.target.value, o.tracking_id, o.delivery_date)}
                                className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer">
                                {['created','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                        {!orders.length && <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No orders found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === HERBS (PRODUCTS) TAB === */}
              {activeTab === 'herbs' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-gray-800">Product Portfolio</h3>
                    <button onClick={() => { setIsAddingHerb(true); setEditingHerbId(null); setHerbForm({ name: '', description: '', category: 'Herbs', price: '', stock: '', image_url: '' }); }} 
                            className="bg-green-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-500/20">
                      <Plus size={16} /> Add Product
                    </button>
                  </div>
                  
                  {/* CRUD Form */}
                  {(isAddingHerb || editingHerbId) && (
                    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 mb-6 animate-fade-in-up">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-black text-gray-900 flex items-center gap-2"><Leaf size={20} className="text-green-500"/> {editingHerbId ? 'Edit Product' : 'Configure New Product'}</h4>
                        <button onClick={() => { setIsAddingHerb(false); setEditingHerbId(null); }} className="text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 p-2 rounded-xl transition"><X size={18} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <input className="border-gray-200 border rounded-2xl px-5 py-3 bg-gray-50/50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-green-400" placeholder="Product Name" value={herbForm.name} onChange={e => setHerbForm({...herbForm, name: e.target.value})} />
                        <select className="border-gray-200 border rounded-2xl px-5 py-3 bg-gray-50/50 font-bold text-sm text-gray-600 focus:bg-white focus:ring-2 focus:ring-green-400" value={herbForm.category} onChange={e => setHerbForm({...herbForm, category: e.target.value})}>
                          <option value="Herbs">Herbs</option><option value="Oils">Oils</option><option value="Powders">Powders</option><option value="Thailam">Thailam</option>
                        </select>
                        <input type="number" className="border-gray-200 border rounded-2xl px-5 py-3 bg-gray-50/50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-green-400" placeholder="Price (₹)" value={herbForm.price} onChange={e => setHerbForm({...herbForm, price: e.target.value})} />
                        <input type="number" className="border-gray-200 border rounded-2xl px-5 py-3 bg-gray-50/50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-green-400" placeholder="Initial Stock Count" value={herbForm.stock} onChange={e => setHerbForm({...herbForm, stock: e.target.value})} />
                        <input className="border-gray-200 border rounded-2xl px-5 py-3 bg-gray-50/50 font-medium text-sm md:col-span-2 focus:bg-white" placeholder="Image Path (e.g. /images/oils/castor.png)" value={herbForm.image_url} onChange={e => setHerbForm({...herbForm, image_url: e.target.value})} />
                        <textarea className="border-gray-200 border rounded-2xl px-5 py-3 bg-gray-50/50 font-medium text-sm md:col-span-2 focus:bg-white flex-1 resize-none" placeholder="Rich Description" rows="3" value={herbForm.description} onChange={e => setHerbForm({...herbForm, description: e.target.value})}></textarea>
                      </div>
                      <div className="mt-6 flex justify-end">
                         <button onClick={saveHerb} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black hover:shadow-lg shadow-green-500/20 transition-all flex items-center gap-2">Save Parameters</button>
                      </div>
                    </div>
                  )}

                  <StockTable 
                    herbs={herbs} 
                    onEdit={(h) => { setEditingHerbId(h.id); setHerbForm(h); setIsAddingHerb(false); }} 
                    onDelete={deleteHerb} 
                  />
                </div>
              )}

              {/* === USERS TAB === */}
              {activeTab === 'users' && (
                <UsersTable users={users} />
              )}

              {/* === REVIEWS TAB === */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-fade-in-up">
                  <h3 className="text-2xl font-black text-gray-800">Community Sentiment Tracker</h3>
                  <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                        <tr><th className="px-6 py-5">Date</th><th className="px-6 py-5">User</th><th className="px-6 py-5">Product Target</th><th className="px-6 py-5">Rating</th><th className="px-6 py-5 w-1/3">Detailed Comment</th><th className="px-6 py-5">Manage</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {reviews.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-black text-gray-800">{r.user_name}</td>
                            <td className="px-6 py-4"><span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border border-green-100">{r.herb_name}</span></td>
                            <td className="px-6 py-4"><StarDisplay rating={r.rating} /></td>
                            <td className="px-6 py-4 text-gray-600 font-medium text-xs leading-relaxed">{r.comment || <span className="text-gray-300 italic">No comment</span>}</td>
                            <td className="px-6 py-4"><button onClick={() => deleteReview(r.id)} className="text-gray-400 hover:text-rose-500 transition p-2.5 bg-gray-50 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === FEEDBACKS TAB === */}
              {activeTab === 'feedbacks' && (
                <div className="space-y-6 animate-fade-in-up">
                  <h3 className="text-2xl font-black text-gray-800">Support & Feedback Inbox</h3>
                  <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                        <tr><th className="px-6 py-5">Timestamp</th><th className="px-6 py-5">User</th><th className="px-6 py-5">Rating</th><th className="px-6 py-5 w-1/2">Message Body</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {feedbacks.map(f => (
                          <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider text-gray-400 whitespace-nowrap">{new Date(f.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-black text-gray-800">{f.user_name}</td>
                            <td className="px-6 py-4"><StarDisplay rating={f.rating} /></td>
                            <td className="px-6 py-4 text-gray-600 font-medium text-xs leading-relaxed">"{f.message}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === CHATBOT TAB === */}
              {activeTab === 'chatbot' && (
                <div className="space-y-6 animate-fade-in-up flex flex-col h-[75vh]">
                  <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-green-500/30">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">Operations AI Controller</h3>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time DB query companion</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-50 flex flex-col overflow-hidden relative">
                    <div className="absolute inset-0 bg-green-50/20 pointer-events-none" />
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
                      {chatHistory.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400/50">
                          <MessageSquare size={54} className="mb-4" />
                          <p className="font-bold tracking-wider text-sm">Waiting for prompt payload...</p>
                        </div>
                      )}
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-6 py-4 rounded-3xl text-sm leading-relaxed font-medium ${msg.role === 'user' ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-br-none shadow-md shadow-green-500/20' : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-50 border border-gray-100 text-green-500 px-6 py-4 rounded-3xl rounded-bl-none font-bold text-xs tracking-widest uppercase animate-pulse">Running Compute...</div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white border-t border-gray-50 relative z-10">
                      <form onSubmit={sendAdminMessage} className="flex gap-3">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} 
                               placeholder="e.g. List all out of stock items or today's revenue..." 
                               className="flex-1 border-gray-100 bg-gray-50/80 border rounded-2xl px-6 py-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-inner" />
                        <button type="submit" disabled={chatLoading} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black disabled:opacity-50 transition-all flex items-center gap-2 tracking-widest text-xs uppercase shadow-xl hover:-translate-y-0.5">
                           Deploy
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
