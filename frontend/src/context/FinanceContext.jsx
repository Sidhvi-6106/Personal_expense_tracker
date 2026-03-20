import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const STORAGE_KEY = "expense-tracker-auth";
const SETTINGS_KEY = "expense-tracker-settings";
const BILLS_KEY = "expense-tracker-bills";

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

const storedAuth = readStorage(STORAGE_KEY, null);
const storedSettings = readStorage(SETTINGS_KEY, {
  theme: "light",
  notifications: true,
  emailSummaries: false,
  compactMode: false,
  showAIInsights: true,
  startWeekOn: "monday"
});
const storedBills = readStorage(BILLS_KEY, []);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

const authHeaders = (token) => ({
  headers: token ? { Authorization: `Bearer ${token}` } : {}
});

const applyTheme = (theme) => {
  document.documentElement.classList.remove("dark");
  document.documentElement.dataset.theme = theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
};

applyTheme(storedSettings.theme);

export const useFinanceContext = create((set, get) => ({
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  transactions: [],
  emis: [],
  billReminders: storedBills,
  settings: storedSettings,
  aiInsights: null,
  loading: false,
  authLoading: false,
  scanningReceipt: false,
  savingProfile: false,
  emiLoading: false,

  persistAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, transactions: [], aiInsights: null, emis: [] });
  },

  updateSettings: (partialSettings) => {
    const nextSettings = { ...get().settings, ...partialSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    applyTheme(nextSettings.theme);
    set({ settings: nextSettings });
    toast.success("Settings updated");
  },

  addBillReminder: (billData) => {
    const newBill = {
      id: `bill-${Date.now()}`,
      ...billData,
      amount: Number(billData.amount)
    };
    const nextBills = [newBill, ...get().billReminders];
    localStorage.setItem(BILLS_KEY, JSON.stringify(nextBills));
    set({ billReminders: nextBills });
    toast.success("Bill reminder added");
  },

  removeBillReminder: (id) => {
    const nextBills = get().billReminders.filter((item) => item.id !== id);
    localStorage.setItem(BILLS_KEY, JSON.stringify(nextBills));
    set({ billReminders: nextBills });
    toast.success("Bill reminder removed");
  },

  register: async (userData) => {
    set({ authLoading: true });
    try {
      await api.post("/auth-api/auth", {
        ...userData,
        monthlyIncome: Number(userData.monthlyIncome)
      });
      toast.success("Registration successful. Please sign in.");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      return false;
    } finally {
      set({ authLoading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ authLoading: true });
    try {
      const res = await api.post("/auth-api/auth/login", { email, password });
      get().persistAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.username}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
      return false;
    } finally {
      set({ authLoading: false });
    }
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const res = await api.get("/auth-api/auth/profile", authHeaders(token));
      get().persistAuth(res.data.user, token);
    } catch {
      get().clearAuth();
    }
  },

  updateProfile: async (profileData) => {
    const { token } = get();
    if (!token) return false;

    set({ savingProfile: true });
    try {
      const res = await api.put("/auth-api/auth/profile", profileData, authHeaders(token));
      get().persistAuth(res.data.user, token);
      toast.success("Profile updated");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
      return false;
    } finally {
      set({ savingProfile: false });
    }
  },

  logout: async () => {
    const { token } = get();
    try {
      if (token) {
        await api.get("/auth-api/logout", authHeaders(token));
      }
    } catch {
      // Ignore logout API failures and clear local session anyway.
    }
    get().clearAuth();
    toast.success("Logged out successfully");
  },

  fetchTransactions: async () => {
    const { token } = get();
    if (!token) return;

    set({ loading: true });
    try {
      const res = await api.get("/transactions-api/transactions", authHeaders(token));
      set({ transactions: res.data.payload || [] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load transactions");
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (formData) => {
    const { token } = get();
    if (!token) {
      toast.error("Please login first");
      return false;
    }

    set({ loading: true });
    const toastId = toast.loading("Saving transaction...");
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      const res = await api.post("/transactions-api/transactions", payload, authHeaders(token));
      set((state) => ({
        transactions: [res.data.payload, ...state.transactions]
      }));
      toast.success("Transaction added", { id: toastId });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save transaction", { id: toastId });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateTransaction: async (id, formData) => {
    const { token } = get();
    if (!token) return false;

    set({ loading: true });
    try {
      const res = await api.put(
        `/transactions-api/transactions/${id}`,
        { ...formData, amount: Number(formData.amount) },
        authHeaders(token)
      );

      set((state) => ({
        transactions: state.transactions.map((item) =>
          item._id === id ? res.data.payload : item
        )
      }));
      toast.success("Transaction updated");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  toggleTransaction: async (id, isActive) => {
    const { token } = get();
    if (!token) return false;

    try {
      await api.patch(`/transactions-api/transactions/${id}`, { isActive }, authHeaders(token));
      set((state) => ({
        transactions: isActive
          ? state.transactions
          : state.transactions.filter((item) => item._id !== id)
      }));
      toast.success(isActive ? "Transaction restored" : "Transaction deleted");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
      return false;
    }
  },

  fetchEmis: async () => {
    const { token } = get();
    if (!token) return;

    set({ emiLoading: true });
    try {
      const res = await api.get("/emi-api/emi", authHeaders(token));
      set({ emis: res.data.payload || [] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load EMI records");
    } finally {
      set({ emiLoading: false });
    }
  },

  addEmi: async (emiData) => {
    const { token } = get();
    if (!token) return false;

    set({ emiLoading: true });
    try {
      const payload = {
        ...emiData,
        loanAmount: Number(emiData.loanAmount),
        interestRate: Number(emiData.interestRate),
        tenureMonths: Number(emiData.tenureMonths)
      };
      const res = await api.post("/emi-api/emi", payload, authHeaders(token));
      set((state) => ({ emis: [res.data.payload, ...state.emis] }));
      toast.success("EMI added");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add EMI");
      return false;
    } finally {
      set({ emiLoading: false });
    }
  },

  fetchAIInsights: async () => {
    const { token, settings } = get();
    if (!token || !settings.showAIInsights) return;

    try {
      const res = await api.get("/ai-api/suggestions", authHeaders(token));
      set({ aiInsights: res.data.payload });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load AI suggestions");
    }
  },

  scanReceipt: async (imageData, filename) => {
    const { token } = get();
    if (!token) return null;

    set({ scanningReceipt: true });
    const toastId = toast.loading("Scanning receipt...");
    try {
      const res = await api.post(
        "/ai-api/scan-receipt",
        { imageData, filename },
        authHeaders(token)
      );
      toast.success("Receipt details extracted", { id: toastId });
      return res.data.payload;
    } catch (err) {
      toast.error(err.response?.data?.message || "Receipt scan failed", { id: toastId });
      return null;
    } finally {
      set({ scanningReceipt: false });
    }
  }
}));
