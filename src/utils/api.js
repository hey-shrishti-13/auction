import axios from 'axios';

const API_URL = "https://auction-backend-41z6.onrender.com"

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
};

export const auctionAPI = {
  getAll: () => api.get('/api/auctions'),
  getActive: () => api.get('/api/auctions/active'),
  getHistory: () => api.get('/api/auctions/history'),
  getById: (id) => api.get(`/api/auctions/${id}`),
  create: (data) => api.post('/api/auctions', data),
  update: (id, data) => api.patch(`/api/auctions/${id}`, data),
  start: (id, duration_hours) => api.post(`/api/auctions/${id}/start`, { duration_hours }),
  register: (id) => api.post(`/api/auctions/${id}/register`),
};

export const bidAPI = {
  placeBid: (data) => api.post('/api/bids', data),
  getAuctionBids: (auctionId) => api.get(`/api/bids/auction/${auctionId}`),
  getTopBidders: (auctionId) => api.get(`/api/bids/auction/${auctionId}/top`),
  getWinner: (auctionId) => api.get(`/api/bids/auction/${auctionId}/winner`),
};

export default api;
