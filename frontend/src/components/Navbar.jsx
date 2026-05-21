import React, { useState, useRef, useEffect } from "react";
import { Bell, IndianRupee, Bot, Menu, X, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useFinanceContext } from "../context/FinanceContext";
import Sidebar from "./Sidebar";

const getPageTitle = (pathname) => {
  const current = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return current.replace(/-/g, " ");
};

const Navbar = () => {
  const location = useLocation();

  const user = useFinanceContext((state) => state.user);
  const settings = useFinanceContext((state) => state.settings);
  const { isChatbotOpen, toggleChatbot, notifications, clearAllNotifications } = useFinanceContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const isDark = settings.theme === "dark";
  const unreadCount = notifications.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className={`h-16 border-b px-4 md:px-8 flex items-center justify-between shrink-0 transition-colors ${
          isDark
            ? "bg-slate-950 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 text-slate-500 hover:text-indigo-600"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm hidden sm:flex">
            <span
              className={`font-semibold capitalize ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div
            className={`hidden md:flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
              isDark
                ? "bg-emerald-950 text-emerald-300"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <IndianRupee size={16} />
            {user?.monthlyIncome || 0} monthly income
          </div>

          <button
            onClick={toggleChatbot}
            className={`flex items-center gap-2 p-2 px-3 transition-colors rounded-lg font-medium text-sm ${
              isChatbotOpen
                ? "bg-indigo-600 text-white"
                : isDark
                ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            <Bot size={18} />
            <span className="hidden md:inline">AI Chatbot</span>
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 transition-colors rounded-lg ${
                isDark
                  ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border z-50 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-slate-50'}`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications ({unreadCount})</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b last:border-0 ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50'}`}>
                        <div className="flex gap-3">
                          <AlertCircle size={18} className={notif.severity === "high" ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
                          <div>
                            <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{notif.title}</h4>
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{notif.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p
                className={`text-sm font-bold leading-none ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {user?.username}
              </p>

              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {user?.email}
              </p>
            </div>

            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 flex-shrink-0 h-full">
            <div className="absolute top-4 right-4 z-50 md:hidden">
               <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'} shadow-lg`}>
                  <X size={20} />
               </button>
            </div>
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;