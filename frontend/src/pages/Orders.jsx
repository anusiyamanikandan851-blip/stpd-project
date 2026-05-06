import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/orders/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-20 text-green-700 font-medium animate-pulse text-xl">Loading Orders...</div>;

  const renderTimeline = (status) => {
    const statuses = ['created', 'processing', 'shipped', 'delivered'];
    const lowerStatus = status ? status.toLowerCase() : 'created';
    
    if (lowerStatus === 'cancelled') {
        return (
            <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-100">
                <XCircle size={20} /> Order Cancelled
            </div>
        );
    }

    const currentIndex = statuses.indexOf(lowerStatus) === -1 ? 0 : statuses.indexOf(lowerStatus);

    return (
      <div className="py-8 px-4 w-full">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          {/* Progress bar background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 rounded-full"></div>
          {/* Progress bar active */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(currentIndex / 3) * 100}%` }}
          ></div>
          
          {/* Steps */}
          {[
            { id: 'created', label: 'Order Placed', icon: Package },
            { id: 'processing', label: 'Processing', icon: Clock },
            { id: 'shipped', label: 'Shipped', icon: Truck },
            { id: 'delivered', label: 'Delivered', icon: CheckCircle }
          ].map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-sm transition-all duration-500 ${isCompleted ? 'bg-green-500 border-green-100 text-white shadow-green-200' + (isActive ? ' ring-4 ring-green-50 scale-110' : '') : 'bg-white border-gray-100 text-gray-300'}`}>
                  <Icon size={20} strokeWidth={isCompleted ? 2.5 : 2} />
                </div>
                <span className={`text-xs md:text-sm font-black absolute -bottom-8 w-max transition-colors duration-300 ${isCompleted ? 'text-green-800' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="bg-green-50 p-6 rounded-full mb-6 text-green-200">
            <Package size={64} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No past orders</h3>
          <p className="text-gray-500 text-lg">You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-lg transition duration-300">
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-100 gap-4">
                <div>
                  <p className="text-sm font-black text-green-700 uppercase tracking-widest bg-green-50 px-3 py-1 rounded w-fit mb-2">Order #{order.id}</p>
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    Placed: {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {order.tracking_id && (
                    <p className="text-sm text-indigo-600 font-bold flex items-center gap-2 mt-2 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit">
                      <Truck size={14} /> Tracking: {order.tracking_id}
                    </p>
                  )}
                  {order.delivery_date && (
                     <p className="text-sm text-emerald-600 font-bold flex items-center gap-2 mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                       <CheckCircle size={14} /> Est. Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                     </p>
                  )}
                </div>
                <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                    {order.payment_status}
                  </span>
                  <p className="text-2xl font-black text-gray-900 mt-0 md:mt-3">₹{order.total_price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mb-8 mt-2 bg-gray-50/30 rounded-2xl border border-gray-50">
                {renderTimeline(order.order_status)}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Order Items</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm text-gray-700 font-medium bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                    <span className="bg-white shadow-sm border border-gray-100 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-green-700">{item.quantity}</span>
                    <span className="text-base">{t(item.herb_name, item.herb_name)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
