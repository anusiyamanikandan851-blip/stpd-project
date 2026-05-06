import { Flame, ArrowRight } from 'lucide-react';

export default function TopProducts({ topProducts }) {
  const displayProducts = topProducts ? topProducts.slice(0, 5) : [];

  return (
    <div className="bg-gradient-to-b from-green-50 to-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-green-100 flex flex-col h-full animate-fade-in-up" style={{animationDelay:'0.3s'}}>
      <div className="p-6 border-b border-green-100/50 flex items-center justify-between">
        <h3 className="text-lg font-black text-green-900 flex items-center gap-2">
          <Flame size={20} className="text-orange-500" /> Hot Products
        </h3>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-5">
        {displayProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No top products yet.</p>
        ) : (
          displayProducts.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center font-black text-gray-300 group-hover:border-green-200 group-hover:text-green-500 transition-colors">
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-green-700 transition-colors">{p.product_name || p.name}</h4>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Sales</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="text-sm font-black text-gray-800 bg-gray-50 px-3 py-1 rounded-lg group-hover:bg-green-100 group-hover:text-green-800 transition-colors">
                  {p.total_sold || p.sold} Units
                </span>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
