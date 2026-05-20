import React from "react";
import { Bell, IndianRupee } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useFinanceContext } from "../context/FinanceContext";

const getPageTitle = (pathname) => {
  const current = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return current.replace(/-/g, " ");
};

const Navbar = () => {
  const location = useLocation();

  const user = useFinanceContext((state) => state.user);
  const settings = useFinanceContext((state) => state.settings);

  const isDark = settings.theme === "dark";

  return (
    <nav
      className={`h-16 border-b px-6 md:px-8 flex items-center justify-between shrink-0 transition-colors ${
        isDark
          ? "bg-slate-950 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className={isDark ? "text-slate-500" : "text-slate-400"}>
          Pages
        </span>

        <span className={isDark ? "text-slate-600" : "text-slate-300"}>
          /
        </span>

        <span
          className={`font-semibold capitalize ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {getPageTitle(location.pathname)}
        </span>
      </div>

      <div className="flex items-center gap-4">
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
          className={`p-2 transition-colors rounded-lg ${
            isDark
              ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
              : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
          }`}
        >
          <Bell size={20} />
        </button>

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

          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;