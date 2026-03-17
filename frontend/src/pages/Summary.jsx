import React from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';

const Summary = () => {
  const { user, transactions } = useFinanceContext();
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = (user?.monthlyIncome || 0) - totalSpent;

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Net Savings</p>
          <h1 className="text-5xl font-bold">{formatCurrency(balance)}</h1>
          <div className="mt-8 flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm italic">
              Monthly Income: {formatCurrency(user?.monthlyIncome)}
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
      </div>
    </div>
  );
};

export default Summary;