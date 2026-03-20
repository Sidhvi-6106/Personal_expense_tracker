import React, { useMemo, useState } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { CreditCard, Landmark } from "lucide-react";
import { formatCurrency } from "../utils/currencyFormatter";

const initialEmi = {
  loanAmount: "",
  interestRate: "",
  tenureMonths: "",
  startDate: "",
  dueDate: ""
};

const calculateMonthlyInstallment = (loanAmount, annualRate, tenureMonths) => {
  const principal = Number(loanAmount);
  const monthlyRate = Number(annualRate) / 12 / 100;
  const months = Number(tenureMonths);

  if (!principal || !months) return 0;
  if (!monthlyRate) return principal / months;
  return (principal * monthlyRate * (1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1);
};

const EMITracker = () => {
  const { emis, addEmi, emiLoading } = useFinanceContext();
  const [form, setForm] = useState(initialEmi);

  const previewInstallment = useMemo(
    () => calculateMonthlyInstallment(form.loanAmount, form.interestRate, form.tenureMonths),
    [form]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await addEmi(form);
    if (success) {
      setForm(initialEmi);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Loan & EMI Tracker</h1>
          <p className="text-slate-500 text-sm">Add EMI plans and track installments with real loan details.</p>
        </div>
        <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl">
          <Landmark size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Add EMI</h2>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="number" placeholder="Loan amount" value={form.loanAmount} onChange={(e) => setForm({ ...form, loanAmount: e.target.value })} required />
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="number" placeholder="Interest rate %" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="number" placeholder="Tenure in months" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })} required />
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Estimated EMI</p>
              <p className="text-lg font-bold text-indigo-900">{formatCurrency(previewInstallment || 0)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          </div>
          <button disabled={emiLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-70">
            {emiLoading ? "Saving EMI..." : "Save EMI"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emis.length > 0 ? emis.map((emi) => {
            const monthlyInstallment = calculateMonthlyInstallment(emi.loanAmount, emi.interestRate, emi.tenureMonths);
            return (
              <div key={emi._id} className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active Installment</p>
                    <h3 className="text-lg font-bold mb-3">{formatCurrency(emi.loanAmount)} Loan</h3>
                    <p className="text-3xl font-bold text-indigo-400">{formatCurrency(monthlyInstallment)}</p>
                    <p className="text-xs text-slate-400 mt-2">{emi.interestRate}% interest • {emi.tenureMonths} months</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                    <CreditCard size={20} className="text-white" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
                  <span>Start: {new Date(emi.startDate).toLocaleDateString()}</span>
                  <span>Next Due: {new Date(emi.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500" />
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-400 italic">No EMI records found. Add your first EMI plan from the form.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EMITracker;
