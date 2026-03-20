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

  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400">Pages</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold capitalize">
          {getPageTitle(location.pathname)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 text-sm font-semibold">
          <IndianRupee size={16} />
          {user?.monthlyIncome || 0} monthly income
        </div>
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
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
