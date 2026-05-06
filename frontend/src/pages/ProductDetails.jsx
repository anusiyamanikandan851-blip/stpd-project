import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Check, ArrowLeft, Heart, Star, Send, User, Flame, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';

function StarRating({ value, onChange, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${(hovered || value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [herb, setHerb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchHerb();
    fetchReviews();
    if (token) checkWishlist();
  }, [id]);

  const fetchHerb = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/herbs/${id}`);
      setHerb(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/reviews/${id}`);
      setReviews(data.reviews);
      setAvgRating(data.average_rating);
      setTotalReviews(data.total_reviews);
    } catch (err) { }
  };

  const checkWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/wishlist/ids`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsWishlisted(data.includes(Number(id)));
    } catch (err) { }
  };

  const toggleWishlist = async () => {
    if (!token) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await axios.delete(`${API_URL}/wishlist/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setIsWishlisted(false);
      } else {
        await axios.post(`${API_URL}/wishlist/`, { herb_id: Number(id) }, { headers: { Authorization: `Bearer ${token}` } });
        setIsWishlisted(true);
      }
    } catch (err) { }
    setWishlistLoading(false);
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.herb_id === herb.id);
    if (existing) { existing.quantity += 1; } 
    else { cart.push({ herb_id: herb.id, name: herb.name, price: herb.price, image_url: herb.image_url, quantity: 1 }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    if (!newRating) { setSubmitMsg(t('select_star_rating', 'Please select a star rating')); return; }
    setSubmitLoading(true);
    try {
      await axios.post(`${API_URL}/reviews/${id}`, { rating: newRating, comment: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitMsg(t('review_submitted', '✅ Review submitted! Thank you.'));
      setNewRating(0);
      setNewComment('');
      fetchReviews();
    } catch (err) {
      setSubmitMsg(t('submit_failed', 'Failed to submit. Please try again.'));
    }
    setSubmitLoading(false);
    setTimeout(() => setSubmitMsg(''), 3000);
  };

  if (loading) return <div className="text-center py-20 text-green-700 text-xl font-medium animate-pulse">{t('loading_details', 'Loading Details...')}</div>;
  if (!herb) return <div className="text-center py-20 text-red-500 font-bold text-xl">{t('herb_not_found', 'Herb not found')}</div>;

  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (d === 0) return t('today', 'Today');
    if (d === 1) return t('yesterday', 'Yesterday');
    return `${d} ${t('days_ago', 'days ago')}`;
  };

  const hasDiscount = herb.original_price > herb.price;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center text-green-700 hover:text-green-800 font-bold mb-6 transition gap-2 bg-white/50 backdrop-blur-md border border-white/60 shadow-sm px-5 py-2.5 rounded-full w-fit hover:bg-white hover:shadow hover:-translate-y-0.5">
        <ArrowLeft size={18} /> {t('back_to_collection', 'Back to Collection')}
      </button>

      <div className="glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in-up border border-white/50 mb-10">
        <div className="md:w-1/2 p-6 md:p-10 bg-gradient-to-br from-green-50/50 to-emerald-50/50 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-green-200/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <img
            src={herb.image_url || '/images/default-herb.png'}
            alt={t(herb.name, herb.name)}
            className="w-full h-auto max-h-[480px] object-cover rounded-3xl shadow-xl ring-1 ring-black/5 transition-transform duration-700 group-hover:scale-105 relative z-10"
            onError={(e) => {
              e.target.onerror = null;
              let fallbackSrc = '/images/herbs/herbs_generic.png';
              if(herb.category === 'Oils' || herb.category === 'Thailam') fallbackSrc = '/images/oils/generic_oil.png';
              else if(herb.category === 'Powders') fallbackSrc = '/images/powders/powder_generic.png';
              e.target.src = fallbackSrc;
            }}
          />
        </div>

        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white/80 backdrop-blur-sm relative z-10">
          <div className="mb-3 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 tracking-widest uppercase flex items-center gap-2">
            <span className="animate-pulse-slow">🌿</span> {t(herb.origin, herb.origin)} {t(herb.category, herb.category)}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">{t(herb.name, herb.name)}</h1>

          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {herb.is_rare && (
              <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                <Flame size={12} fill="currentColor" /> {t('rare_herb', 'Rare')}
              </span>
            )}
            {hasDiscount && (
              <span className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                <Tag size={12} fill="currentColor" /> {t('discount', 'Sale')}
              </span>
            )}
            {herb.stock < 15 && herb.stock > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black shadow-md">
                {t('low_stock', 'Low Stock')}
              </span>
            )}
            {herb.stock === 0 && (
              <span className="bg-gray-500 text-white px-3 py-1 rounded-lg text-xs font-black shadow-md">
                {t('out_of_stock', 'Out of Stock')}
              </span>
            )}
          </div>

          {totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <StarRating value={Math.round(avgRating)} size={18} />
              <span className="font-bold text-gray-700">{avgRating}</span>
              <span className="text-gray-400 text-sm">({totalReviews} {t('reviews', 'reviews')})</span>
            </div>
          )}

          <div className="mb-8 flex items-center gap-4">
            <div className="flex flex-col">
              {hasDiscount && <span className="text-sm text-gray-400 font-bold line-through relative top-2 ml-4">₹{herb.original_price.toFixed(2)}</span>}
              <p className="text-4xl font-black text-white bg-gradient-to-br from-green-600 to-emerald-500 inline-block px-8 py-4 rounded-3xl shadow-lg shadow-green-500/30">{t('price')}: ₹{herb.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2"><span className="w-2 h-5 rounded-full bg-green-500" />{t('description', 'Description')}</h3>
            <p className="text-gray-600 leading-relaxed">{herb.description}</p>
          </div>
          
          {herb.benefits && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2"><span className="w-2 h-5 rounded-full bg-purple-500" />{t('benefits', 'Benefits')}</h3>
              <p className="text-gray-600 leading-relaxed">{herb.benefits}</p>
            </div>
          )}

          {herb.usage_instructions && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2"><span className="w-2 h-5 rounded-full bg-blue-500" />{t('usage', 'Usage Instructions')}</h3>
              <p className="text-gray-600 leading-relaxed">{herb.usage_instructions}</p>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2"><span className="w-2 h-5 rounded-full bg-green-500" />{t('traditional_uses', 'Traditional Uses')}</h3>
            <p className="text-gray-600 leading-relaxed">{herb.uses}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={herb.stock === 0}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all duration-300 transform hover:-translate-y-1 ${added ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-400' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-xl shadow-green-600/30 disabled:opacity-50 disabled:translate-y-0'}`}
            >
              {added ? <><Check size={22} strokeWidth={3} className="text-emerald-500" /> {t('added', 'Added!')}</> : <><ShoppingCart size={22} /> {t('add_to_cart')}</>}
            </button>

            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`p-4 rounded-2xl font-bold border-2 transition-all duration-300 hover:-translate-y-1 ${isWishlisted ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white border-gray-200 text-gray-400 hover:border-rose-400 hover:text-rose-500'}`}
              title={isWishlisted ? t('remove_wishlist', 'Remove from Wishlist') : t('add_wishlist', 'Add to Wishlist')}
            >
              <Heart size={22} className={isWishlisted ? 'fill-white' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-8 shadow-xl border border-white/50 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{t('customer_reviews', 'Customer Reviews')}</h2>
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating value={Math.round(avgRating)} size={16} />
                <span className="text-gray-600 font-semibold text-sm">{avgRating}/5 ({totalReviews} {t('reviews', 'review(s)')})</span>
              </div>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-2xl mb-8">
            <Star size={40} strokeWidth={1} className="mx-auto mb-2" />
            <p className="font-medium">{t('no_reviews', 'No reviews yet — be the first!')}</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map(r => (
              <div key={r.id} className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {r.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{r.user_name}</span>
                      <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                    </div>
                    <StarRating value={r.rating} size={14} />
                    {r.comment && <p className="text-gray-600 text-sm mt-2 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-lg font-black text-gray-900 mb-5">{t('write_review', 'Write a Review')}</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('your_rating', 'Your Rating')}</label>
              <StarRating value={newRating} onChange={setNewRating} size={30} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('your_review', 'Your Review (optional)')}</label>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
                placeholder={t('review_placeholder', "Share your experience with this herb...")}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none font-medium text-gray-800 placeholder-gray-400 transition-all"
              />
            </div>
            {submitMsg && (
              <p className={`text-sm font-bold px-4 py-2 rounded-xl ${submitMsg.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{submitMsg}</p>
            )}
            <button
              type="submit"
              disabled={submitLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-7 py-3 rounded-2xl font-black hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {submitLoading ? t('submitting', 'Submitting...') : t('submit_review', 'Submit Review')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
