import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare } from 'lucide-react';
import API_URL from '../config';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  const token = localStorage.getItem('token');

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/feedback/`);
      setFeedbacks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/feedback/`, { message, rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('');
      setRating(5);
      setSuccess("Thank you for your feedback!");
      setTimeout(() => setSuccess(''), 3000);
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
      <div className="md:w-1/3">
        <div className="bg-gradient-to-br from-green-700 to-green-900 p-8 md:p-10 rounded-3xl text-white shadow-2xl sticky top-28 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 opacity-10">
            <MessageSquare size={160} />
          </div>
          <div className="relative z-10">
            <MessageSquare size={42} className="mb-6 text-green-300" strokeWidth={1.5} />
            <h2 className="text-3xl font-extrabold mb-4 tracking-tight leading-tight">Share Your Experience</h2>
            <p className="text-green-100 text-sm mb-8 leading-relaxed font-medium">We value your thoughts on our herbal remedies. Your feedback helps us share the power of traditional healing with the world.</p>
            
            {token ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {success && <div className="bg-green-500/30 border border-green-400 p-4 rounded-xl text-sm font-bold shadow-inner">{success}</div>}
                <div>
                  <label className="block text-sm font-bold mb-2 text-green-50">Rate your experience</label>
                  <div className="flex gap-2 bg-white/10 p-3 rounded-2xl border border-white/20 w-fit">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform transform hover:scale-125 hover:-translate-y-1"
                      >
                        <Star size={26} fill={star <= rating ? "#FBBF24" : "transparent"} stroke={star <= rating ? "#FBBF24" : "#A7F3D0"} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-green-50">Your Testimonial</label>
                  <textarea 
                    required 
                    rows="4"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full rounded-2xl bg-white/10 border border-white/20 px-5 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm resize-none shadow-inner"
                    placeholder="Tell us how the herbs helped you..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-white text-green-900 font-extrabold text-lg py-4 rounded-xl hover:bg-green-50 transition shadow-xl disabled:opacity-70 transform hover:-translate-y-0.5"
                >
                  {submitting ? "Submitting securely..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-md text-sm font-medium shadow-inner">
                Please <a href="/login" className="underline font-bold text-green-200 hover:text-white transition">sign in</a> to submit your feedback across our community.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="md:w-2/3">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Community Testimonials</h2>
        {loading ? (
          <div className="text-green-700 animate-pulse font-medium text-lg">Loading voices of healing...</div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
            <Star size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No testimonials yet. Be the first to share your journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {feedbacks.map(f => (
              <div key={f.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-green-800 font-black text-xl shadow-inner border border-green-50">
                      {f.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg leading-tight mb-1">{f.user_name}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(f.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < f.rating ? "#FBBF24" : "#E5E7EB"} stroke={i < f.rating ? "#FBBF24" : "#E5E7EB"} strokeWidth={1.5} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-base leading-relaxed mt-5 italic font-medium">"{f.message}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
