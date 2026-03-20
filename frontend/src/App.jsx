import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RootLayout from "./components/RootLayout";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import TransactionHistory from "./pages/TransactionHistory";
import Analytics from "./pages/Analytics";
import EMITracker from "./pages/EMITracker";
import BillReminder from "./pages/BillRemainder";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import Reports from "./pages/Reports";
import Summary from "./pages/Summary";
import Notification from "./pages/Notification";
import Login from "./components/Login";
import Register from "./components/Register";
import { useFinanceContext } from "./context/FinanceContext";

const ProtectedRoutes = () => {
  const { token, fetchProfile } = useFinanceContext();

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [fetchProfile, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
};

const AuthRoutes = () => {
  const token = useFinanceContext((state) => state.token);
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route element={<AuthRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-transaction" element={<AddTransaction />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/emi-tracker" element={<EMITracker />} />
          <Route path="/bill-remainder" element={<BillReminder />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/notifications" element={<Notification />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
