import React from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { Pie } from 'react-chartjs-2';
import { formatCurrency } from '../utils/currencyFormatter';

const Reports = () => {
  const transactions = useFinanceContext((state) => state.transactions);
  
  // Logic to calculate category totals for the report
  const reportData = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Monthly Expenditure Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-4">Expense Breakdown</h3>
          {Object.entries(reportData).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between py-2 border-b border-slate-50 text-sm">
              <span className="text-slate-500">{cat}</span>
              <span className="font-semibold text-slate-800">{formatCurrency(amt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Reports;