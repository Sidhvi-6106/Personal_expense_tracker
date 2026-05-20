import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  History,
  PieChart,
  Calculator,
  Bell,
  FileText,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useFinanceContext } from "../context/FinanceContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BarChart3, label: "Summary", path: "/summary" },
  { icon: PlusCircle, label: "Add Transaction", path: "/add-transaction" },
  { icon: History, label: "Transaction History", path: "/history" },
  { icon: PieChart, label: "Analytics", path: "/analytics" },
  { icon: Calculator, label: "EMI Tracker", path: "/emi-tracker" },
  { icon: Bell, label: "Bill Reminder", path: "/bill-remainder" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const logout = useFinanceContext((state) => state.logout);
  const settings = useFinanceContext((state) => state.settings);

  const navigate = useNavigate();

  const isDark = settings.theme === "dark";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`hidden md:flex w-72 border-r flex-col h-screen overflow-y-auto transition-colors ${
        isDark
          ? "bg-slate-950 border-slate-800"
          : "bg-white border-slate-200"
      }`}
    >
      <div
        className={`p-6 border-b transition-colors ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <h2 className="text-2xl font-bold text-indigo-600 tracking-tight">
          ExpensePilot
        </h2>

        <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Personal expense tracker
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? isDark
                      ? "bg-indigo-600 text-white font-semibold"
                      : "bg-indigo-50 text-indigo-700 font-semibold"
                    : isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div
        className={`p-4 border-t transition-colors ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
            isDark
              ? "text-red-400 hover:bg-red-950"
              : "text-red-500 hover:bg-red-50"
          }`}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;