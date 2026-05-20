import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';

const BalanceCard = ({ title, amount, type }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${isIncome ? 'bg-emerald-50 text-emerald-600' : isExpense ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {isIncome ? <ArrowUpRight size={20} /> : isExpense ? <ArrowDownRight size={20} /> : <Wallet size={20} />}
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800">
          {formatCurrency(amount || 0)}
        </h2>
        <p className="text-slate-400 text-xs mt-1">Updated just now</p>
      </div>
    </div>
  );
};

export default BalanceCard;