import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';

export default function Wishlist() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/wishlist/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (herbId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${herbId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(items.filter(i => i.herb_id !== herbId));
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(c => c.herb_id === item.herb_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ herb_id: item.herb_id, name: item.name, price: item.price, image_url: item.image_url, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Show brief feedback
    const btn = document.getElementById(`cart-btn-${item.herb_id}`);
    if (btn) { btn.textContent = '✓ Added!'; setTimeout(() => { btn.textContent = 'Add to Cart'; }, 1500); }
  };

  if (loading) return <div className="text-center py-20 text-green-700 text-xl animate-pulse font-medium">Loading Wishlist...</div>;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
          <Heart size={28} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
          <p className="text-gray-500 font-medium">{items.length} saved herb{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-28 glass-panel rounded-3xl shadow-sm flex flex-col items-center gap-4">
          <div className="bg-rose-50 p-6 rounded-full">
            <Heart size={64} strokeWidth={1.5} className="text-rose-200" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Your wishlist is empty</h3>
          <p className="text-gray-500 text-lg">Save your favorite herbs to buy later</p>
          <Link to="/" className="mt-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Browse Herbs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={item.wishlist_id}
              className="glass-panel rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-white flex flex-col group animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <Link to={`/herbs/${item.herb_id}`} className="block h-52 overflow-hidden relative bg-gray-50">
                <img
                  src={item.image_url}
                  alt={t(item.name, item.name)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <Link to={`/herbs/${item.herb_id}`}>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-1 hover:text-green-700 transition line-clamp-1">{t(item.name, item.name)}</h2>
                </Link>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>

                <div className="flex items-center justify-between mb-3 border-t border-gray-100 pt-3">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">₹{item.price.toFixed(2)}</span>
                  {item.stock > 0
                    ? <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">In Stock</span>
                    : <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100">Out of Stock</span>
                  }
                </div>

                <div className="flex gap-2">
                  <button
                    id={`cart-btn-${item.herb_id}`}
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.herb_id)}
                    className="p-2.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
