import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import API_URL from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/api/login`, { email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const decodedToken = jwtDecode(data.token);
      if (decodedToken.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full glass-panel rounded-3xl shadow-2xl p-8 space-y-8 animate-fade-in-up relative z-10 border border-white/50">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-4 text-center text-sm text-gray-500 font-medium">
            Sign in to access your herbal remedies
          </p>
        </div>
        
        <div className="flex p-1 bg-gray-100 rounded-xl w-full mx-auto">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'user' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            User Login
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'admin' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Admin Login
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:-translate-y-1 shadow-xl shadow-green-600/30"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-green-500 group-hover:text-green-400 transition" />
              </span>
              Sign In
            </button>
          </div>
          
          <div className="text-center text-sm font-medium text-gray-600">
            New to HerbNest? <Link to="/register" className="text-green-600 hover:text-green-800 font-bold transition">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
