import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useFinanceContext } from '../context/FinanceContext';

const RootLayout = () => {
  const { token, fetchTransactions, fetchEmis, settings, refreshNotifications } = useFinanceContext();

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchEmis();
    }
    refreshNotifications();
  }, [fetchEmis, fetchTransactions, refreshNotifications, token]);

  return (
    <div className={`flex h-screen overflow-hidden ${settings.theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50"}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className={`flex-1 overflow-y-auto ${settings.compactMode ? "p-4" : "p-6"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
