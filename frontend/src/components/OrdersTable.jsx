import { FileText } from 'lucide-react';

const STATUS_CONFIG = {
  created: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
  shipped: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Shipped' },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Delivered' },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Cancelled' }
};

export default function OrdersTable({ orders, limit = 5 }) {
  const displayOrders = orders ? orders.slice(0, limit) : [];

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden flex flex-col h-full animate-fade-in-up" style={{animationDelay:'0.2s'}}>
      <div className="flex items-center justify-between p-6 border-b border-gray-50">
        <h3 className="text-xl font-black text-gray-800">Latest Orders</h3>
        <button className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg transition">
          <FileText size={16} /> View All
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayOrders.length === 0 ? (
               <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No orders found.</td></tr>
            ) : (
              displayOrders.map(o => {
                const conf = STATUS_CONFIG[o.order_status?.toLowerCase()] || STATUS_CONFIG.created;

                return (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-gray-800">#{o.id}</td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-gray-500 text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-black text-green-700">₹{o.total_price?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex w-fit ${conf.bg} ${conf.text}`}>
                        {conf.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
