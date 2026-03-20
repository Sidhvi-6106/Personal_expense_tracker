import React, { useState } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { BellRing, CalendarDays, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/currencyFormatter";

const initialBill = {
  title: "",
  category: "Utilities",
  amount: "",
  dueDate: "",
  frequency: "Monthly"
};

const BillReminder = () => {
  const { billReminders, addBillReminder, removeBillReminder } = useFinanceContext();
  const [form, setForm] = useState(initialBill);

  const handleSubmit = (e) => {
    e.preventDefault();
    addBillReminder(form);
    setForm(initialBill);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bill Reminders</h1>
        <p className="text-slate-500 text-sm">Add upcoming utility and recurring bills, then track them from one place.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Add Bill Reminder</h2>
          <input className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Bill name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            <select className="w-full px-4 py-3 rounded-xl border border-slate-200" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </div>
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">Save Reminder</button>
        </form>

        <div className="grid gap-4">
          {billReminders.length > 0 ? billReminders.map((bill) => (
            <div key={bill.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                  <BellRing size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 capitalize">{bill.title}</h3>
                  <p className="text-xs text-slate-400">{bill.category} • Due {new Date(bill.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">{bill.frequency}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(bill.amount)}</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">{bill.frequency}</span>
                </div>
                <button onClick={() => removeBillReminder(bill.id)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <CalendarDays className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 italic">No bill reminders yet. Add your first recurring bill here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillReminder;
