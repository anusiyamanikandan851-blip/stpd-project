import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, Sparkles, X, ChevronDown, Flame, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';

const SYMPTOMS = ['headache', 'stress', 'digestion', 'sleep', 'immunity', 'skin', 'pain', 'cold', 'fever', 'anxiety', 'memory', 'energy'];
const CATEGORIES = ['Herbs', 'Oils', 'Thailam', 'Powders'];

export default function Home() {
  const { t } = useTranslation();
  const [herbs, setHerbs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(new Set());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    try {
      const [herbsRes, recsRes] = await Promise.all([
        axios.get(`${API_URL}/herbs/`),
        axios.get(`${API_URL}/herbs/recommendations`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      ]);
      setHerbs(herbsRes.data);
      setRecommendations(recsRes.data);

      if (token) {
        const wRes = await axios.get(`${API_URL}/wishlist/ids`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistIds(new Set(wRes.data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim() || selectedSymptom || selectedCategory || priceRange[0] > 0 || priceRange[1] < 2000) {
        applyFilters();
      } else {
        fetchHerbs();
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, selectedSymptom, selectedCategory, priceRange]);

  const fetchHerbs = async () => {
    const { data } = await axios.get(`${API_URL}/herbs/`);
    setHerbs(data);
    setIsFiltered(false);
  };

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedSymptom) params.set('symptom', selectedSymptom);
      if (selectedCategory) params.set('category', selectedCategory.toLowerCase());
      if (priceRange[0] > 0) params.set('min_price', priceRange[0]);
      if (priceRange[1] < 2000) params.set('max_price', priceRange[1]);
      const { data } = await axios.get(`${API_URL}/herbs/search?${params}`);
      setHerbs(data);
      setIsFiltered(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (e, herbId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    setWishlistLoading(prev => new Set([...prev, herbId]));
    try {
      if (wishlistIds.has(herbId)) {
        await axios.delete(`${API_URL}/wishlist/${herbId}`, { headers: { Authorization: `Bearer ${token}` } });
        setWishlistIds(prev => { const s = new Set(prev); s.delete(herbId); return s; });
      } else {
        await axios.post(`${API_URL}/wishlist/`, { herb_id: herbId }, { headers: { Authorization: `Bearer ${token}` } });
        setWishlistIds(prev => new Set([...prev, herbId]));
      }
    } catch (err) { }
    setWishlistLoading(prev => { const s = new Set(prev); s.delete(herbId); return s; });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSymptom('');
    setSelectedCategory('');
    setPriceRange([0, 2000]);
    setShowFilters(false);
  };

  if (loading) return <div className="text-center py-20 text-green-700 text-xl animate-pulse font-medium">{t('loading_herbs', "Loading Nature's Remedies...")}</div>;

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'oils' || cat === 'thailam') return '🧴';
    if (cat === 'powders') return '🫙';
    return '🌿';
  };

  const HerbCard = ({ herb, idx, showDelay = true }) => {
    const hasDiscount = herb.original_price > herb.price;
    const imgSrc = herb.image_url || '/images/default-herb.png';

    return (
      <Link
        to={`/herbs/${herb.id}`}
        key={herb.id}
        className="glass-panel rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-white flex flex-col group animate-fade-in-up relative"
        style={showDelay ? { animationDelay: `${idx * 0.07}s` } : {}}
      >
        <div className="h-56 overflow-hidden relative bg-gradient-to-br from-green-100 to-emerald-50">
          <img
            src={imgSrc}
            alt={t(herb.name, herb.name)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              let fallbackSrc = '/images/herbs/herbs_generic.png';
              if(herb.category === 'Oils' || herb.category === 'Thailam') fallbackSrc = '/images/oils/generic_oil.png';
              else if(herb.category === 'Powders') fallbackSrc = '/images/powders/powder_generic.png';
              e.target.src = fallbackSrc;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Enhanced Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {herb.is_rare && (
              <span className="bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                <Flame size={12} fill="currentColor" /> {t('rare_herb', 'Rare')}
              </span>
            )}
            {hasDiscount && (
              <span className="bg-rose-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-md flex items-center gap-1">
                <Tag size={12} fill="currentColor" /> {t('discount', 'Sale')}
              </span>
            )}
            {herb.stock < 15 && herb.stock > 0 && (
              <span className="bg-red-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-md">
                {t('low_stock', 'Low Stock')}
              </span>
            )}
          </div>

          <button
            onClick={(e) => toggleWishlist(e, herb.id)}
            disabled={wishlistLoading.has(herb.id)}
            className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 z-10 ${wishlistIds.has(herb.id) ? 'bg-rose-500 text-white scale-110' : 'bg-white/80 text-gray-400 hover:bg-rose-50 hover:text-rose-500'}`}
          >
            <Heart size={16} className={wishlistIds.has(herb.id) ? 'fill-white' : ''} />
          </button>
        </div>
        <div className="p-6 flex flex-col flex-1 bg-white/50 relative z-10 border-t border-white/40">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-extrabold text-gray-900 line-clamp-1">{t(herb.name, herb.name)}</h2>
            <span className="text-[10px] font-bold tracking-wider text-green-700 bg-green-100 px-2 py-1 rounded-md uppercase">{t(herb.category, herb.category)}</span>
          </div>
          <p className="text-gray-500 text-xs line-clamp-2 mb-5 flex-1 leading-relaxed">{herb.description}</p>
          <div className="flex justify-between items-end mt-auto border-t border-gray-100 pt-4">
            <div className="flex flex-col">
              {hasDiscount && <span className="text-xs text-gray-400 font-bold line-through ml-0.5 relative top-1">₹{herb.original_price.toFixed(2)}</span>}
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">₹{herb.price.toFixed(2)}</span>
            </div>
            <span className="text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-md transition-all px-4 py-2 rounded-xl group-hover:shadow-green-500/40">{t('details', 'Details')}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="relative glass-panel rounded-3xl p-10 mb-10 text-center shadow-2xl py-20 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-400/10 to-green-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-emerald-500 mb-5 tracking-tighter drop-shadow-sm">{t('welcome')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">{t('hero_subtitle', 'Explore our curated collection of ancient medicinal herbs, backed by centuries of traditional wisdom.')}</p>
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all font-medium text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold border transition-all ${showFilters || isFiltered ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'}`}
          >
            <SlidersHorizontal size={18} />
            {t('filters', 'Filters')}
            {isFiltered && <span className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full">ON</span>}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg animate-fade-in-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">{t('price_range', 'Price Range')}: ₹{priceRange[0]} — ₹{priceRange[1]}</label>
              <div className="space-y-2">
                <input type="range" min={0} max={2000} step={50} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-green-600" />
                <div className="flex justify-between text-xs text-gray-400 font-medium"><span>₹0</span><span>₹2000</span></div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">{t('category', 'Category')}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${selectedCategory === c ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'}`}
                  >
                    {t(c, c)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">{t('filter_symptoms', 'Filter by Symptom')}</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSymptom(selectedSymptom === s ? '' : s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${selectedSymptom === s ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'}`}
                  >
                    {t(s, s)}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-500 font-medium flex items-center gap-1 transition">
                <X size={14} /> {t('clear_filters', 'Clear all filters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && !isFiltered && !searchQuery && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('for_you', 'For You')}</h2>
              <p className="text-gray-500 text-sm font-medium">{t('for_you_subtitle', 'Personalized picks based on your interests')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recommendations.map((herb, idx) => (
              <Link
                key={herb.id}
                to={`/herbs/${herb.id}`}
                className="glass-panel rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-400 hover:-translate-y-2 group border border-white animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="h-32 overflow-hidden relative bg-gradient-to-br from-green-100 to-emerald-50">
                  <img
                    src={herb.image_url || '/images/default-herb.png'}
                    alt={t(herb.name, herb.name)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      let fallbackSrc = '/images/herbs/herbs_generic.png';
                      if(herb.category === 'Oils' || herb.category === 'Thailam') fallbackSrc = '/images/oils/generic_oil.png';
                      else if(herb.category === 'Powders') fallbackSrc = '/images/powders/powder_generic.png';
                      e.target.src = fallbackSrc;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <button onClick={(e) => toggleWishlist(e, herb.id)} className={`absolute top-1.5 right-1.5 p-1.5 rounded-full shadow backdrop-blur-sm transition-all ${wishlistIds.has(herb.id) ? 'bg-rose-500 text-white' : 'bg-white/70 text-gray-400 hover:text-rose-500'}`}>
                    <Heart size={12} className={wishlistIds.has(herb.id) ? 'fill-white' : ''} />
                  </button>
                  <span className="absolute bottom-2 left-2 text-white font-black text-xs drop-shadow">₹{herb.price.toFixed(0)}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 line-clamp-1">{t(herb.name, herb.name)}</p>
                  <p className="text-[10px] uppercase font-bold text-violet-600 mt-1">{t(herb.category, herb.category)}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-10 mb-4" />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {isFiltered ? t('search_results', 'Search Results') : t('all_herbs', 'All Products')}
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-0.5">{herbs.length} {t('products_available', 'products available')}</p>
        </div>
        {isFiltered && (
          <button onClick={clearFilters} className="text-sm text-green-700 font-bold flex items-center gap-1 hover:underline">
            <X size={14} /> {t('clear', 'Clear')}
          </button>
        )}
      </div>

      {herbs.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <Search size={48} strokeWidth={1} className="mx-auto text-gray-200 mb-4" />
          <p className="text-xl font-bold text-gray-500">{t('no_products', 'No products found')}</p>
          <button onClick={clearFilters} className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition">{t('clear_filters', 'Clear Filters')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {herbs.map((herb, idx) => <HerbCard key={herb.id} herb={herb} idx={idx} />)}
        </div>
      )}
    </div>
  );
}
