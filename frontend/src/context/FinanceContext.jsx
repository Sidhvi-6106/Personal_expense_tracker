import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie'; // Import js-cookie

const API_URL = "http://localhost:4000";

export const useFinanceContext = create((set, get) => ({
  // Initialize state from Cookies
  user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
  token: Cookies.get('token') || null,
  transactions: [],
  loading: false,

  // --- AUTH ACTIONS ---
  
  register: async (userData) => {
    set({ loading: true });
    try {
      await axios.post(`${API_URL}/auth-api/auth`, userData);
      toast.success("Registration successful! Please login.");
      set({ loading: false });
      return true;
    } catch (err) {
      set({ loading: false });
      toast.error(err.response?.data?.message || "Registration failed");
      return false;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_URL}/auth-api/auth/login`, { email, password });
      
      const { token, user } = res.data;

      // Store in Cookies (expires in 7 days)
      Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('user', JSON.stringify(user), { expires: 7, secure: true, sameSite: 'strict' });
      
      set({ user, token, loading: false });
      toast.success(`Welcome back, ${user.username}!`);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth-api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: res.data.user });
      // Update cookie in case profile data changed
      Cookies.set('user', JSON.stringify(res.data.user), { expires: 7 });
    } catch (err) {
      console.error("Profile fetch failed");
    }
  },

  logout: () => {
    // Remove Cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    set({ user: null, token: null, transactions: [] });
    toast.success("Logged out successfully");
  },

  // --- TRANSACTION ACTIONS ---

  fetchTransactions: async () => {
    const { user, token } = get();
    if (!user || !token) return;
    
    set({ loading: true });
    try {
      const userId = user._id; 
      const res = await axios.get(`${API_URL}/transactions-api/transactions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      set({ transactions: res.data.payload, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error("Could not load transactions");
    }
  },
  // ... inside useFinanceContext
addTransaction: async (formData) => {
  const { user } = get();
  if (!user) return toast.error("Please login first");

  const toastId = toast.loading("Saving transaction...");
  try {
    const userId = user.id || user._id;
    // FETCH CALL: Posting to your backend
    const res = await axios.post(`${API_URL}/transactions-api/transactions/${userId}`, formData, {
      withCredentials: true // Required for cookie-parser
    });

    // Update the local state immediately so History.jsx sees it
    set((state) => ({
      transactions: [res.data.payload, ...state.transactions]
    }));

    toast.success("Transaction added!", { id: toastId });
    return true; 
  } catch (err) {
    toast.error("Failed to save transaction", { id: toastId });
    return false;
  }
},
// Add these to your useFinanceContext state
aiInsights: null,

fetchAIStats: async () => {
  const { user } = get();
  if (!user) return;
  try {
    // FETCH CALL: Adjust this endpoint to match your AI route
    const res = await axios.get(`${API_URL}/ai-api/insights/${user.id || user._id}`, {
      withCredentials: true
    });
    set({ aiInsights: res.data.payload });
  } catch (err) {
    console.error("AI Insights fetch failed", err);
  }
},
}));