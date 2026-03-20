import React from "react";
import { Bell, Info, Clock3, TriangleAlert } from "lucide-react";
import { useFinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currencyFormatter";

const Notification = () => {
  const { notifications, settings } = useFinanceContext();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center space-y-4">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600">
          <Bell size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
        <p className="text-slate-500">
          Due-soon bill alerts and budget alerts appear here and as toast notifications when enabled.
        </p>
      </div>

      <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <Info size={18} className="text-indigo-500" />
          Alert Status
        </h3>
        <div className="text-sm text-slate-600">
          In-app notifications are currently <span className="font-semibold">{settings.notifications ? "enabled" : "disabled"}</span>.
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {notifications.length ? notifications.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.severity === "high" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                {item.type === "budget" ? <TriangleAlert size={20} /> : <Clock3 size={20} />}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.message}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">{formatCurrency(item.amount)}</p>
              <p className="text-xs text-slate-400">
                {item.type === "budget" ? "Current month" : new Date(item.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )) : (
          <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center text-slate-400">
            No active alerts right now. Budget and due-soon bill alerts will show here automatically.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
