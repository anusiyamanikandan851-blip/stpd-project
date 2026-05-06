// Central API base URL.
// In production (Vercel), set VITE_API_URL to your Render backend URL:
//   VITE_API_URL=https://antigravity-herb-api.onrender.com
// In local dev, you can leave it unset — it falls back to localhost.
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export default API_URL;
