import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function Charts({ topProducts, revenueTrend }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h4 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-600" /> Revenue Trend
        </h4>
        {revenueTrend && revenueTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <RechartsTooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-6">No revenue data available.</p>
        )}
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h4 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-600" /> Top Products
        </h4>
        {topProducts && topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} width={120} />
              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="sold" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-6">No sales data found.</p>
        )}
      </div>
    </div>
  );
}
