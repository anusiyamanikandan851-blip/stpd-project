import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationPanel from './NotificationPanel';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-4 z-50 mx-4 md:mx-8 rounded-2xl transition-all duration-300 shadow-lg border border-white/40">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold tracking-wider text-green-800 hover:text-green-600 transition flex items-center gap-2">
          <span className="text-3xl animate-pulse-slow">🌿</span>
          <span className="text-gradient">HerbNest</span>
        </Link>

        <div className="flex items-center space-x-4">
          {token ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="text-green-800 hover:text-green-600 font-semibold transition-all hover:-translate-y-1 flex items-center gap-1.5 p-2 rounded-xl hover:bg-green-50">
                <ShoppingCart size={20} />
                <span className="hidden sm:inline text-sm">{t('cart')}</span>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="text-rose-500 hover:text-rose-600 font-semibold transition-all hover:-translate-y-1 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50" title={t('wishlist', 'Wishlist')}>
                <Heart size={20} />
                <span className="hidden sm:inline text-sm">{t('wishlist', 'Wishlist')}</span>
              </Link>

              {/* Notifications Bell */}
              <NotificationPanel />

              {/* Admin Links */}
              {user.role === 'admin' && (
                <>
                  <Link 
                    to="/admin" 
                    onClick={() => localStorage.setItem('adminTab', 'users')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-4 py-2 rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 transform hidden md:block"
                  >
                    {t('user_insights', 'User Insights')}
                  </Link>
                  <Link 
                    to="/admin" 
                    onClick={() => localStorage.setItem('adminTab', 'overview')}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 transform hidden md:block"
                  >
                    {t('admin')}
                  </Link>
                </>
              )}

              {/* Non-admin links */}
              {user.role !== 'admin' && (
                <Link to="/orders" className="text-green-800 hover:text-green-600 font-semibold transition hidden md:block hover:-translate-y-1 text-sm">
                  {t('orders')}
                </Link>
              )}

              <Link to="/feedback" className="text-green-800 hover:text-green-600 font-semibold transition hidden md:block hover:-translate-y-1 text-sm">
                {t('feedback', 'Feedback')}
              </Link>

              {/* User avatar + logout */}
              <div className="flex items-center gap-2 ml-2 border-l border-green-200 pl-4">
                <div
                  className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full cursor-pointer hover:shadow-md transition-all hover:scale-105"
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/orders')}
                >
                  <User size={15} />
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm hover:shadow"
                  title={t('logout', 'Logout')}
                >
                  <LogOut size={17} />
                </button>
              </div>
            </>
          ) : (
            <div className="space-x-4 flex items-center">
              <Link to="/login" className="text-green-800 font-semibold hover:text-green-600 transition">{t('login')}</Link>
              <Link to="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300">{t('register')}</Link>
            </div>
          )}
          <LanguageSelector />
        </div>
      </div>
    </nav>
  );
}
