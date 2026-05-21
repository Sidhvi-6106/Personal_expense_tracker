import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from './Chatbot';
import { useFinanceContext } from '../context/FinanceContext';

const RootLayout = () => {
  const { token, fetchTransactions, fetchEmis, fetchBillReminders, settings, refreshNotifications, isChatbotOpen, setChatbotOpen } = useFinanceContext();

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchEmis();
      fetchBillReminders();
    }
    refreshNotifications();
  }, [fetchEmis, fetchTransactions, fetchBillReminders, refreshNotifications, token]);

  return (
    <div className={`flex h-screen overflow-hidden ${settings.theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50"}`}>
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
        <Navbar />
        <main className={`flex-1 overflow-y-auto ${settings.compactMode ? "p-4" : "p-6"}`}>
          <Outlet />
        </main>
      </div>
      
      {/* Chatbot Panel */}
      {isChatbotOpen && (
        <div className={`w-[380px] shrink-0 border-l shadow-2xl flex flex-col transition-all duration-300 ${settings.theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <Chatbot onClose={() => setChatbotOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default RootLayout;