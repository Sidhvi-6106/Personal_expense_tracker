import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/apiBase";

const STORAGE_KEY = "expense-tracker-auth";
const SETTINGS_KEY = "expense-tracker-settings";
const BILLS_KEY = "expense-tracker-bills";
const ALERTS_KEY = "expense-tracker-alerts";
const CUSTOM_ALERTS_KEY = "expense-tracker-custom-alerts";
const DISMISSED_ALERTS_KEY = "expense-tracker-dismissed-alerts";

const readStorage = (key, fallback) => {
  try {
    return (
      JSON.parse(localStorage.getItem(key) || "null") ??
      fallback
    );
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
const storedCustomAlerts = readStorage(CUSTOM_ALERTS_KEY, []);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const authHeaders = (token) => ({
  headers: token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {}
});

const applyTheme = (theme) => {
  document.documentElement.classList.remove("dark");

  document.documentElement.dataset.theme = theme;

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
};

const daysUntil = (dateString) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const target = new Date(dateString);

  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target - today) / (1000 * 60 * 60 * 24)
  );
};

const monthKey = (value) => {
  const date = new Date(value);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const currentMonthKey = () =>
  monthKey(new Date());

const calculateMonthlyExpenseTotal = (
  transactions,
  targetMonth = currentMonthKey()
) =>
  transactions
    .filter(
      (item) =>
        item.type !== "income" &&
        monthKey(item.date) === targetMonth
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

const buildBillAlerts = (billReminders) =>
  billReminders
    .filter((bill) => !bill.paid)
    .map((bill) => {
      const remainingDays = daysUntil(
        bill.dueDate
      );

      return {
        id: `bill-${bill._id || bill.id}`,

        type: "bill",

        title: bill.title,

        message:
          remainingDays < 0
            ? `${bill.title} is overdue.`
            : remainingDays === 0
            ? `${bill.title} is due today.`
            : `${bill.title} is due in ${remainingDays} day${
                remainingDays === 1 ? "" : "s"
              }.`,

        dueDate: bill.dueDate,

        amount: bill.amount,

        severity:
          remainingDays <= 1
            ? "high"
            : "medium",

        remainingDays
      };
    })
    .filter((alert) => alert.remainingDays <= 3);

const buildEmiAlerts = (emis) =>
  emis
    .filter((emi) => !emi.paid)
    .map((emi) => {
      const remainingDays = daysUntil(emi.dueDate);
      const monthlyAmount = Math.round(emi.loanAmount / emi.tenureMonths);
      return {
        id: `emi-alert-${emi._id}`,
        type: "emi",
        title: "EMI Reminder",
        message:
          remainingDays < 0
            ? `Your EMI of ₹${monthlyAmount} for ${emi.merchant || 'loan'} is overdue.`
            : remainingDays === 0
            ? `Your EMI of ₹${monthlyAmount} for ${emi.merchant || 'loan'} is due today.`
            : `Your EMI of ₹${monthlyAmount} for ${emi.merchant || 'loan'} is due in ${remainingDays} day${remainingDays === 1 ? "" : "s"}.`,
        dueDate: emi.dueDate,
        amount: monthlyAmount,
        severity: remainingDays <= 1 ? "high" : "medium",
        remainingDays
      };
    })
    .filter((alert) => alert.remainingDays <= 3);

const buildBudgetAlerts = (
  transactions,
  monthlyIncome = 0
) => {
  const total =
    calculateMonthlyExpenseTotal(
      transactions
    );

  if (!monthlyIncome || !total) return [];

  const usage = total / monthlyIncome;

  if (usage < 0.8) return [];

  return [
    {
      id: `budget-${currentMonthKey()}`,

      type: "budget",

      title: "Monthly Budget Alert",

      message:
        usage >= 1
          ? "You have exceeded your monthly budget."
          : `You have used ${Math.round(
              usage * 100
            )}% of your monthly budget.`,

      dueDate: new Date().toISOString(),

      amount: total,

      severity:
        usage >= 1 ? "high" : "medium",

      remainingDays: 0
    }
  ];
};

applyTheme(storedSettings.theme);

export const useFinanceContext = create(
  (set, get) => ({
    user: storedAuth?.user || null,

    token: storedAuth?.token || null,

    transactions: [],

    emis: [],

    billReminders: storedBills,
    customAlerts: storedCustomAlerts,
    settings: storedSettings,

    notifications:
      buildBillAlerts(storedBills),

    aiInsights: {
      summary: "",
      suggestions: [],
      risks: [],
      source: "heuristic"
    },

    loading: false,

    authLoading: false,

    scanningReceipt: false,

    savingProfile: false,

    emiLoading: false,

    isChatbotOpen: false,

    toggleChatbot: () => set((state) => ({ isChatbotOpen: !state.isChatbotOpen })),

    setChatbotOpen: (isOpen) => set({ isChatbotOpen: isOpen }),

    persistAuth: (user, token) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, token })
      );

      set({ user, token });
    },

    clearAuth: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ALERTS_KEY);
      localStorage.removeItem(DISMISSED_ALERTS_KEY);

      set({
        user: null,
        token: null,
        transactions: [],
        aiInsights: {
          summary: "",
          suggestions: [],
          risks: [],
          source: "heuristic"
        },
        emis: []
      });
    },

    refreshNotifications: () => {
      const seenAlerts = readStorage(
        ALERTS_KEY,
        []
      );

      const billAlerts = buildBillAlerts(
        get().billReminders
      );

      const emiAlerts = buildEmiAlerts(get().emis);

      const budgetAlerts = buildBudgetAlerts(
        get().transactions,
        get().user?.monthlyIncome || 0
      );

      const allAlerts = [
        ...budgetAlerts,
        ...billAlerts,
        ...emiAlerts,
        ...(get().customAlerts || [])
      ].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

      const dismissedAlerts = readStorage(DISMISSED_ALERTS_KEY, []);
      const activeAlerts = allAlerts.filter(a => !dismissedAlerts.includes(a.id));

      set({ notifications: activeAlerts });

      if (!get().settings.notifications)
        return;

      const updatedSeen = [...seenAlerts];
      let changed = false;

      activeAlerts.forEach((alert) => {
        if (!updatedSeen.includes(alert.id)) {
          toast(alert.message, {
            icon:
              alert.severity === "high"
                ? "⏰"
                : "🔔"
          });

          updatedSeen.push(alert.id);

          changed = true;
        }
      });


      if (changed) {
        localStorage.setItem(
          ALERTS_KEY,
          JSON.stringify(updatedSeen)
        );
      }
    },

    clearAllNotifications: () => {
      const currentAlertIds = get().notifications.map(a => a.id);
      const dismissedAlerts = readStorage(DISMISSED_ALERTS_KEY, []);
      const newDismissed = [...new Set([...dismissedAlerts, ...currentAlertIds])];
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(newDismissed));
      set({ notifications: [], customAlerts: [] });
      localStorage.setItem(CUSTOM_ALERTS_KEY, JSON.stringify([]));
    },

    fetchBillReminders: async () => {
      const { token } = get();
      if (!token) return;
      
      try {
        const res = await api.get("/bill-reminder-api/bill-reminder", authHeaders(token));
        const bills = res.data.payload || [];
        localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
        set({ billReminders: bills });
        get().refreshNotifications();
      } catch (err) {
        console.error("Failed to fetch bills", err);
      }
    },

    addBillReminder: async (bill) => {
      const { token } = get();
      if (!token) return false;

      try {
        const res = await api.post("/bill-reminder-api/bill-reminder", bill, authHeaders(token));
        set((state) => {
          const billReminders = [...state.billReminders, res.data.payload];
          localStorage.setItem(BILLS_KEY, JSON.stringify(billReminders));
          return { billReminders };
        });
        get().refreshNotifications();
        toast.success("Bill reminder added");
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add bill reminder");
        return false;
      }
    },

    updateBillReminder: async (id, updatedData) => {
      const { token } = get();
      if (!token) return false;

      try {
        const res = await api.put(`/bill-reminder-api/bill-reminder/${id}`, updatedData, authHeaders(token));
        const updatedBill = res.data.payload;
        set((state) => {
          const billReminders = state.billReminders.map((bill) => (bill._id === id ? updatedBill : bill));
          localStorage.setItem(BILLS_KEY, JSON.stringify(billReminders));
          return { billReminders };
        });
        get().refreshNotifications();
        toast.success("Bill reminder updated");
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update bill reminder");
        return false;
      }
    },

    removeBillReminder: async (id) => {
      const { token } = get();
      if (!token) return false;

      try {
        await api.patch(`/bill-reminder-api/bill-reminder/${id}`, { isActive: false }, authHeaders(token));
        set((state) => {
          const billReminders = state.billReminders.filter((b) => b._id !== id);
          localStorage.setItem(BILLS_KEY, JSON.stringify(billReminders));
          return { billReminders };
        });
        get().refreshNotifications();
        toast.success("Bill reminder removed");
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to remove bill reminder");
        return false;
      }
    },

    markBillPaid: async (id, paid) => {
      const { token } = get();
      if (!token) return false;

      try {
        const bill = get().billReminders.find(b => b._id === id);
        const res = await api.patch(`/bill-reminder-api/bill-reminder/pay/${id}`, { paid }, authHeaders(token));
        const updatedBill = res.data.payload;

        set((state) => {
          const billReminders = state.billReminders.map((item) => 
            item._id === id ? updatedBill : item
          );
          localStorage.setItem(BILLS_KEY, JSON.stringify(billReminders));
          return { billReminders };
        });
        toast.success(paid ? "Bill paid and next due date updated" : "Bill marked as unpaid");

        if (paid && bill) {
          await get().addTransaction({
            type: "expense",
            amount: bill.amount,
            category: bill.category || "Bills & Utilities",
            description: `${bill.title} Payment`,
            merchant: "Bill Reminder",
            date: new Date().toISOString().split('T')[0]
          });
        }

        get().refreshNotifications();
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update bill");
        return false;
      }
    },

    updateSettings: (partialSettings) => {
      const nextSettings = {
        ...get().settings,
        ...partialSettings
      };

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(nextSettings)
      );

      applyTheme(nextSettings.theme);

      set({ settings: nextSettings });

      get().refreshNotifications();

      toast.success("Settings updated");
    },

    register: async (userData) => {
      set({ authLoading: true });

      try {
        console.log("backend called")
        await api.post("/auth-api/auth", {
          ...userData,
          monthlyIncome: Number(
            userData.monthlyIncome
          )
        });

        toast.success(
          "Registration successful"
        );

        return true;
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Registration failed"
        );

        return false;
      } finally {
        set({ authLoading: false });
      }
    },

    login: async ({ email, password }) => {
  set({ authLoading: true });

  try {
    const res = await api.post(
      "/auth-api/auth/login",
      { email, password }
    );

    get().persistAuth(
      res.data.user,
      res.data.token
    );

    toast.success(
      `Welcome back, ${res.data.user.username}!`
    );

    return true;

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Invalid credentials"
    );

    return false;

  } finally {

    set({ authLoading: false });

  }
},

fetchProfile: async () => {
  const { token } = get();

  if (!token) return;

  try {

    const res = await api.get(
      "/auth-api/auth/profile",
      authHeaders(token)
    );

    set({
      user: res.data.user
    });

  } catch (err) {

    console.log(err);

    toast.error(
      err.response?.data?.message ||
      "Failed to fetch profile"
    );
  }
},

updateProfile: async (userData) => {
  const { token } = get();
  if (!token) return false;
  
  set({ savingProfile: true });
  
  try {
    const res = await api.put(
      "/auth-api/auth/profile",
      userData,
      authHeaders(token)
    );
    
    set({ user: res.data.user });
    
    // Also update local storage so user persists on reload
    const currentAuth = readStorage(STORAGE_KEY, null);
    if (currentAuth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...currentAuth,
        user: res.data.user
      }));
    }

    toast.success("Profile updated");
    return true;
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update profile");
    return false;
  } finally {
    set({ savingProfile: false });
  }
},

    logout: async () => {
      const { token } = get();

      try {
        if (token) {
          await api.get(
            "/auth-api/logout",
            authHeaders(token)
          );
        }
      } catch (err) {
        console.error("Logout failed", err);
      }

      get().clearAuth();

      toast.success("Logged out");
    },

    fetchTransactions: async () => {
      const { token } = get();

      if (!token) return;

      set({ loading: true });

      try {
        const res = await api.get(
          "/transactions-api/transactions",
          authHeaders(token)
        );

        set({
          transactions:
            res.data.payload || []
        });

        get().refreshNotifications();
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Could not load transactions"
        );
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

      try {
        const payload = {
          ...formData,
          amount: Number(formData.amount)
        };

        const res = await api.post(
          "/transactions-api/transactions",
          payload,
          authHeaders(token)
        );

        set((state) => ({
          transactions: [
            res.data.payload,
            ...state.transactions
          ]
        }));

        get().refreshNotifications();

        toast.success("Transaction added");

        return true;
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to add transaction"
        );

        return false;
      } finally {
        set({ loading: false });
      }
    },

    updateTransaction: async (
      id,
      updatedData
    ) => {
      const { token } = get();

      if (!token) {
        toast.error("Please login first");
        return false;
      }

      try {
        const response = await api.put(
          `/transactions-api/transactions/${id}`,
          {
            ...updatedData,
            amount: Number(
              updatedData.amount
            )
          },
          authHeaders(token)
        );

        const updatedTransaction =
          response.data.payload;

        set((state) => ({
          transactions:
            state.transactions.map((item) =>
              item._id === id
                ? updatedTransaction
                : item
            )
        }));

        get().refreshNotifications();

        toast.success(
          "Transaction updated"
        );

        return true;
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to update transaction"
        );

        return false;
      }
    },

    toggleTransaction: async (
      id,
      isActive
    ) => {
      const { token } = get();

      if (!token) return false;

      try {
        await api.patch(
          `/transactions-api/transactions/${id}`,
          { isActive },
          authHeaders(token)
        );

        set((state) => ({
          transactions: isActive
            ? state.transactions
            : state.transactions.filter(
                (item) =>
                  item._id !== id
              )
        }));

        get().refreshNotifications();

        toast.success(
          isActive
            ? "Transaction restored"
            : "Transaction deleted"
        );

        return true;
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Action failed"
        );

        return false;
      }
    },

    fetchEmis: async () => {
      const { token } = get();

      if (!token) return;

      set({ emiLoading: true });

      try {
        const res = await api.get(
          "/emi-api/emi",
          authHeaders(token)
        );

        set({
          emis: res.data.payload || []
        });
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Could not load EMI records"
        );
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

          loanAmount: Number(
            emiData.loanAmount
          ),

          interestRate: Number(
            emiData.interestRate
          ),

          tenureMonths: Number(
            emiData.tenureMonths
          )
        };

        const res = await api.post(
          "/emi-api/emi",
          payload,
          authHeaders(token)
        );

        const newEmi = res.data.payload;
        set((state) => ({
          emis: [
            newEmi,
            ...state.emis
          ]
        }));
        
        // Add custom notification for EMI
        const newAlert = {
          id: `emi-${newEmi._id}-${Date.now()}`,
          type: "emi-added",
          title: "EMI Added",
          message: `Your EMI for ${newEmi.merchant || 'loan'} has been added. Reminders will be sent before the due date.`,
          dueDate: new Date().toISOString(),
          severity: "medium",
          remainingDays: 0
        };
        
        set((state) => {
          const updatedCustomAlerts = [newAlert, ...(state.customAlerts || [])].slice(0, 10);
          localStorage.setItem(CUSTOM_ALERTS_KEY, JSON.stringify(updatedCustomAlerts));
          return { customAlerts: updatedCustomAlerts };
        });
        
        get().refreshNotifications();

        toast.success("EMI added");

        return true;
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to add EMI"
        );

        return false;
      } finally {
        set({ emiLoading: false });
      }
    },

    updateEmi: async (id, updatedData) => {
      const { token } = get();
      if (!token) return false;

      try {
        const payload = {
          ...updatedData,
          loanAmount: Number(updatedData.loanAmount),
          interestRate: Number(updatedData.interestRate),
          tenureMonths: Number(updatedData.tenureMonths)
        };

        const res = await api.put(`/emi-api/emi/${id}`, payload, authHeaders(token));
        const updatedEmi = res.data.payload;

        set((state) => ({
          emis: state.emis.map((emi) => (emi._id === id ? updatedEmi : emi))
        }));

        get().refreshNotifications();
        toast.success("EMI updated");
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update EMI");
        return false;
      }
    },

    toggleEmi: async (id, isActive) => {
      const { token } = get();
      if (!token) return false;

      try {
        await api.patch(`/emi-api/emi/${id}`, { isActive }, authHeaders(token));

        set((state) => ({
          emis: isActive
            ? state.emis
            : state.emis.filter((emi) => emi._id !== id)
        }));

        get().refreshNotifications();
        toast.success(isActive ? "EMI restored" : "EMI deleted");
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to toggle EMI");
        return false;
      }
    },

    markEmiPaid: async (id, paid) => {
      const { token } = get();

      if (!token) return false;

      try {
        await api.patch(
          `/emi-api/emi/pay/${id}`,
          { paid },
          authHeaders(token)
        );

        set((state) => ({
          emis: state.emis.map((emi) =>
            emi._id === id
              ? {
                  ...emi,
                  paid,
                  paymentDate: paid
                    ? new Date().toISOString()
                    : null
                }
              : emi
          )
        }));

        toast.success(
          paid
            ? "EMI marked as paid"
            : "EMI marked as unpaid"
        );

        if (paid) {
          const emi = get().emis.find(e => e._id === id);
          if (emi) {
            const monthlyAmount = Math.round(emi.loanAmount / emi.tenureMonths);
            await get().addTransaction({
              type: "expense",
              amount: monthlyAmount,
              category: "Bills & Utilities",
              description: `EMI Payment`,
              merchant: "EMI Tracker",
              date: new Date().toISOString().split('T')[0]
            });

            // Auto-advance due date
            const newDueDate = new Date(emi.dueDate);
            newDueDate.setMonth(newDueDate.getMonth() + 1);
            await get().updateEmi(id, { ...emi, dueDate: newDueDate, paid: false });
          }
        }

        return true;
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Failed to update EMI"
        );

        return false;
      }
    },

    fetchAIInsights: async () => {
      const { token, settings } = get();

      if (
        !token ||
        !settings.showAIInsights
      )
        return;

      try {
        const res = await api.get(
          "/ai-api/suggestions",
          authHeaders(token)
        );

        set({
          aiInsights: {
            summary:
              res.data?.payload?.summary ||
              "Your finances are being analyzed.",

            suggestions:
              res.data?.payload
                ?.suggestions || [],

            risks:
              res.data?.payload?.risks ||
              [],

            source:
              res.data?.payload?.source ||
              "heuristic"
          }
        });
      } catch (err) {
        console.log(
          "AI INSIGHTS ERROR:",
          err
        );

        set({
          aiInsights: {
            summary:
              "Unable to load AI suggestions currently.",

            suggestions: [
              "Continue tracking expenses regularly.",
              "Review your highest spending category.",
              "Set monthly category budgets."
            ],

            risks: [],

            source: "fallback"
          }
        });

        toast.error(
          err.response?.data?.message ||
            "Could not load AI suggestions"
        );
      }
    },

    scanReceipt: async (
      imageData,
      filename
    ) => {
      const { token } = get();

      if (!token) return null;

      set({ scanningReceipt: true });

      try {
        const res = await api.post(
          "/ai-api/scan-receipt",
          {
            imageData,
            filename
          },
          authHeaders(token)
        );

        toast.success(
          "Receipt scanned successfully"
        );

        return res.data.payload;
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            "Receipt scan failed"
        );

        return null;
      } finally {
        set({ scanningReceipt: false });
      }
    }
  })
);
