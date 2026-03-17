import React from 'react';
import {useFinanceContext } from '../context/FinanceContext';
import { formatDate } from '../utils/dateFormatter';
import { formatCurrency } from '../utils/currencyFormatter';

const TransactionList = ({ limit }) => {
  const transactions = useFinanceContext((state) => state.transactions);
  const displayList = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-50">
            <th className="pb-4 font-semibold">Category</th>
            <th className="pb-4 font-semibold">Date</th>
            <th className="pb-4 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {displayList.map((t) => (
            <tr key={t._id} className="group hover:bg-slate-50/50 transition-colors">
              <td className="py-4">
                <p className="font-medium text-slate-700">{t.category}</p>
                <p className="text-xs text-slate-400">{t.description || 'No description'}</p>
              </td>
              <td className="py-4 text-sm text-slate-500">{formatDate(t.date)}</td>
              <td className="py-4 text-right font-semibold text-slate-700">
                {formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">No transactions found.</div>
      )}
    </div>
  );
};

export default TransactionList;