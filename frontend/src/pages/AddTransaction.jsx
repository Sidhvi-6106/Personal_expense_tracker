import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Sparkles } from "lucide-react";
import TransactionForm from "../components/TransactionForm";

const AddTransaction = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <PlusCircle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add Transaction</h1>
              <p className="text-slate-500 text-sm">Record income, expenses, or auto-fill details from a receipt scan.</p>
            </div>
          </div>

          <TransactionForm />
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-indigo-300" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Smart workflow</p>
          </div>
          <h2 className="text-2xl font-bold leading-tight">Use AI to reduce manual entry.</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            <li>Upload a receipt image and the app can extract merchant, amount, date, and category.</li>
            <li>Switch between expense and income so analytics stay accurate.</li>
            <li>Saved transactions appear immediately in history, dashboard, and AI insights.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
