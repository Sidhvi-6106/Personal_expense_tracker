import React, { useState } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { CalendarDays, Pencil, ReceiptText, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/currencyFormatter";

const initialBill = {
  _id: "",
  title: "",
  category: "Utilities",
  amount: "",
  dueDate: "",
  frequency: "Monthly"
};

const getRemainingDays = (dueDate) => {
  const today = new Date();
  const target = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const getDueLabel = (remainingDays) => {
  if (remainingDays < 0) return "Overdue";
  if (remainingDays === 0) return "Due today";
  if (remainingDays === 1) return "Due tomorrow";
  return `${remainingDays} days left`;
};

const BillReminder = () => {
  const {
    billReminders,
    addBillReminder,
    updateBillReminder,
    removeBillReminder,
    markBillPaid
  } = useFinanceContext();

  const [form, setForm] = useState(initialBill);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = form._id
      ? await updateBillReminder(form._id, form)
      : await addBillReminder(form);

    if (success) {
      setForm(initialBill);
    }
  };

  const startEdit = (bill) => {
    setForm({
      _id: bill._id,
      title: bill.title,
      category: bill.category,
      amount: bill.amount,
      dueDate: bill.dueDate?.slice(0, 10),
      frequency: bill.frequency
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bill Reminders</h1>
        <p className="text-slate-500 text-sm">
          Add recurring bills and track the next due date after each payment.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-800">
            {form._id ? "Edit Bill Reminder" : "Add Bill Reminder"}
          </h2>

          <input
            className="w-full px-4 py-3 rounded-xl border border-slate-200"
            placeholder="Bill name"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />

            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              type="number"
              min="1"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />

            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700">
              {form._id ? "Update Reminder" : "Save Reminder"}
            </button>

            {form._id ? (
              <button
                type="button"
                onClick={() => setForm(initialBill)}
                className="px-4 py-3 rounded-xl font-semibold bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {billReminders.length > 0 ? (
            billReminders.map((bill) => {
              const remainingDays = getRemainingDays(bill.dueDate);

              return (
                <div
                  key={bill._id}
                  className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group"
                >
                  <div className="relative z-10 flex justify-between items-start gap-4">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                        Recurring Bill
                      </p>

                      <h3 className="text-lg font-bold mb-3 capitalize">
                        {bill.title}
                      </h3>

                      <p className="text-3xl font-bold text-white">
                        {formatCurrency(bill.amount)}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        {bill.category} - {bill.frequency}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                        <ReceiptText size={20} className="text-white" />
                      </div>

                      <button
                        type="button"
                        onClick={() => startEdit(bill)}
                        className="bg-white/10 p-2 rounded-xl hover:bg-white/20"
                        aria-label={`Edit ${bill.title}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeBillReminder(bill._id)}
                        className="bg-white/10 p-2 rounded-xl hover:bg-rose-500/30"
                        aria-label={`Delete ${bill.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        Next Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </span>
                      <span>{getDueLabel(remainingDays)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 bg-emerald-600 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-500"
                        onClick={() => markBillPaid(bill._id, true)}
                      >
                        Paid
                      </button>

                      <button
                        type="button"
                        className="flex-1 bg-rose-600 py-2 rounded-xl text-sm font-semibold hover:bg-rose-500"
                        onClick={() => markBillPaid(bill._id, false)}
                      >
                        Not Paid
                      </button>
                    </div>

                    {bill.paymentDate ? (
                      <p className="text-emerald-200 text-xs font-semibold">
                        Last paid on {new Date(bill.paymentDate).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-blue-100 text-xs font-semibold">
                        Reminder active
                      </p>
                    )}
                  </div>

                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500" />
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <CalendarDays className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 italic">
                No bill reminders yet. Add your first recurring bill from the form.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillReminder;
