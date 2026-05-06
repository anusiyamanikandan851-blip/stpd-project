import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function StockTable({ herbs, onEdit, onDelete }) {
  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  return (
    <div className="overflow-x-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-50/50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
          <tr>
            <th className="px-6 py-5">Product Name</th>
            <th className="px-6 py-5">Category</th>
            <th className="px-6 py-5">Stock Quantity</th>
            <th className="px-6 py-5">Status</th>
            <th className="px-6 py-5">Controls</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {herbs.map(h => {
            const status = getStockStatus(h.stock);
            return (
              <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                    <img src={h.image_url || '/images/default-herb.png'} alt={h.name} className="w-full h-full object-cover rounded-lg" onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '🌿'; }} />
                  </div>
                  {h.name}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{h.category}</span>
                </td>
                <td className="px-6 py-4 font-black text-gray-700">{h.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase text-[10px] border ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(h)} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-2.5 rounded-xl transition bg-gray-50">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(h.id)} className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition bg-gray-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {herbs.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
