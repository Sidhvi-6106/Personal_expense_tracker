import React, { useMemo } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currencyFormatter";

const Reports = () => {
  const transactions = useFinanceContext((state) => state.transactions);

  const reportData = useMemo(() => {
    return transactions
      .filter((item) => item.type !== "income")
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {});
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Expense Report</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4">Category Breakdown</h3>
        {Object.entries(reportData).length ? (
          Object.entries(reportData).map(([cat, amt]) => (
            <div key={cat} className="flex justify-between py-3 border-b border-slate-50 text-sm">
              <span className="text-slate-500">{cat}</span>
              <span className="font-semibold text-slate-800">{formatCurrency(amt)}</span>
            </div>
          ))
        ) : (
          <p className="text-slate-400">Add transactions to generate reports.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
