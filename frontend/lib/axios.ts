import axios from 'axios';
import Cookies from 'js-cookie';

// MARKER: Setup koneksi dasar ke Backend
const api = axios.create({
  // UPDATE PENTING:
  // Baca URL dari Environment Variable dulu.
  // Jika tidak ada (sedang di laptop), baru pakai localhost.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
  // Penting untuk kirim cookie/session antar domain beda (Vercel -> Render)
  withCredentials: true, 
});

// MARKER: Otomatis tempelkan Token di setiap request (jika ada)
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;