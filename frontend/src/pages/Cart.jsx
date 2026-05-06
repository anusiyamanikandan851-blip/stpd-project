import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Cart() {
  const { t } = useTranslation();
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cart.map(item => {
      if (item.herb_id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.herb_id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 lg:py-32 text-center px-4">
        <div className="bg-green-50 p-6 rounded-full text-green-600 mb-6 shadow-sm border border-green-100">
          <ShoppingBag size={56} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">{t('empty_basket')}</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-lg">{t('empty_basket_desc')}</p>
        <Link to="/" className="bg-green-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-800 transition shadow-lg flex items-center gap-2 transform hover:-translate-y-1">
          {t('browse_treasures')} <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
      <div className="lg:w-2/3 border border-gray-100 bg-white rounded-3xl p-6 md:p-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-6 border-gray-100">{t('herbal_selection')}</h1>
        <div className="space-y-6">
          {cart.map(item => (
            <div key={item.herb_id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-6 hover:shadow-md transition">
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <img src={item.image_url} alt={t(item.name, item.name)} className="w-24 h-24 object-cover rounded-xl shadow-sm border border-white" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t(item.name, item.name)}</h3>
                  <p className="text-green-700 font-bold text-lg mt-1">₹{item.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 self-end sm:self-auto w-full sm:w-auto justify-between pl-4 sm:pl-0">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                  <button onClick={() => updateQuantity(item.herb_id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded hover:bg-gray-100 font-bold text-gray-700">-</button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.herb_id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded hover:bg-gray-100 font-bold text-gray-700">+</button>
                </div>
                <button onClick={() => removeItem(item.herb_id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition" title="Remove">
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:w-1/3">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-b pb-4">{t('order_summary')}</h2>
          <div className="space-y-4 mb-8 text-gray-600 font-medium text-lg">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span className="text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('shipping')}</span>
              <span className="text-green-600 font-bold">{t('free')}</span>
            </div>
            <div className="border-t border-gray-100 pt-6 mt-4 flex justify-between text-2xl font-black text-gray-900">
              <span>{t('total')}</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-green-700 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-800 transition shadow-[0_4px_14px_0_rgba(21,128,61,0.39)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.23)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {t('checkout')} <ArrowRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
