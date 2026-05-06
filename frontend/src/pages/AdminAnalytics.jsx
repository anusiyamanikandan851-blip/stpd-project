import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AnalyticsCards from '../components/AnalyticsCards';
import SalesChart from '../components/SalesChart';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import API_URL from '../config';

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [token, navigate, user.role]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sumRes, prodRes, revRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/analytics/summary`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/top-products`, { headers }),
        axios.get(`${API_URL}/api/admin/analytics/revenue-trend`, { headers })
      ]);
      
      setSummary(sumRes.data);
      setTopProducts(prodRes.data);
      setRevenueTrend(revRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== 'admin') return null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Smart Analytics Dashboard</h2>
      
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 text-green-600 animate-pulse gap-3">
          <Leaf size={40} className="animate-bounce" />
          <span className="font-medium">Loading Analytics...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-bold">{error}</div>
      ) : (
        <>
          <AnalyticsCards summary={summary} />
          <SalesChart topProducts={topProducts} revenueTrend={revenueTrend} />
        </>
      )}
    </div>
  );
}
