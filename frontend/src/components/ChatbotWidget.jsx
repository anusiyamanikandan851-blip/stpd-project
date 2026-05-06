import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! 🌿 I'm your HerbNest AI assistant. Describe your symptoms or ask me anything about herbs!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!token) return null;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const updatedMessages = [...messages, { text: userMessage, sender: 'user' }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Build conversation history (last 5 user/bot exchanges) for context
    const history = updatedMessages
      .filter(m => m.sender === 'user' || m.sender === 'bot')
      .slice(-10)
      .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

    try {
      const { data } = await axios.post(
        `${API_URL}/chatbot/`,
        { message: userMessage, history, language: i18n.language || 'en' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, {
        text: data.response,
        sender: 'bot',
        suggestedHerbs: data.suggested_herbs
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 z-50 ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}`}
        title="Open AI Herb Assistant"
      >
        <MessageCircle size={28} className="animate-pulse-slow" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 w-[360px] md:w-[400px] glass-panel rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col animate-fade-in-up"
          style={{ height: '560px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex justify-between items-center shadow-md flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bot size={22} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-300 rounded-full border-2 border-green-600" />
              </div>
              <div>
                <h3 className="font-black text-base tracking-wide flex items-center gap-1">
                  Herb AI <Sparkles size={14} className="text-yellow-300" />
                </h3>
                <p className="text-xs text-green-100 opacity-90">Context-Aware • Always helpful</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-300 hover:rotate-90 transition-all duration-300 p-1">
              <X size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col animate-fade-in-up ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                style={{ animationDelay: `${Math.min(idx * 0.04, 0.3)}s` }}
              >
                {msg.sender === 'bot' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Bot size={12} className="text-white" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Herb AI</span>
                  </div>
                )}
                <div className={`max-w-[88%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed font-medium whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>

                {/* Suggested Herb Cards */}
                {msg.suggestedHerbs && msg.suggestedHerbs.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.suggestedHerbs.slice(0, 3).map(herb => (
                      <div key={herb.id} className="bg-white border border-gray-100 rounded-2xl p-2.5 flex gap-3 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                        <img src={herb.image_url} alt={t(herb.name, herb.name)} className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <p className="font-bold text-sm text-gray-900 line-clamp-1">{t(herb.name, herb.name)}</p>
                          <p className="text-gray-500 text-xs line-clamp-1">{herb.description.substring(0, 45)}...</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-green-700 font-black text-sm">₹{herb.price.toFixed(2)}</span>
                            <Link
                              to={`/herbs/${herb.id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded-xl hover:bg-green-500 font-bold transition"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-start gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {['Help with stress', 'Boost immunity', 'Better sleep'].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-xl font-semibold hover:bg-green-100 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('chatbot_placeholder')}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-gray-50 font-medium transition-all hover:bg-white"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all duration-300"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
