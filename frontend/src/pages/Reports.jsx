import React, { useMemo, useState } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currencyFormatter";

const getMonthOptions = (transactions) => {
  const keys = [...new Set(transactions.map((item) => {
    const date = new Date(item.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }))].sort().reverse();

  return keys.length ? keys : [`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`];
};

const formatMonthLabel = (value) => new Date(`${value}-01`).toLocaleDateString("en-IN", {
  month: "long",
  year: "numeric"
});

const Reports = () => {
  const { transactions, user } = useFinanceContext();
  const monthOptions = useMemo(() => getMonthOptions(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);

  const report = useMemo(() => {
    const filtered = transactions.filter((item) => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return key === selectedMonth;
    });

    const expenses = filtered.filter((item) => item.type !== "income");
    const income = filtered.filter((item) => item.type === "income");
    const byCategory = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    return {
      filtered,
      totalExpense: expenses.reduce((sum, item) => sum + item.amount, 0),
      totalIncome: income.reduce((sum, item) => sum + item.amount, 0) || user?.monthlyIncome || 0,
      byCategory
    };
  }, [selectedMonth, transactions, user?.monthlyIncome]);

  const exportReport = () => {
    const rows = [
      ["Date", "Type", "Category", "Merchant", "Description", "Amount"],
      ...report.filtered.map((item) => [
        new Date(item.date).toLocaleDateString("en-IN"),
        item.type || "expense",
        item.category,
        item.merchant || "",
        item.description || "",
        item.amount
      ])
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financial-report-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Monthly Expenditure Report</h2>
          <p className="text-sm text-slate-500">Filter reports month by month and export them as CSV.</p>
        </div>
        <div className="flex gap-3">
          <select className="rounded-xl border border-slate-200 px-4 py-2 bg-white" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthOptions.map((option) => (
              <option key={option} value={option}>{formatMonthLabel(option)}</option>
            ))}
          </select>
          <button onClick={exportReport} className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Income</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(report.totalIncome)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Expenses</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(report.totalExpense)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Net</p>
          <h3 className={`text-2xl font-bold mt-2 ${report.totalIncome - report.totalExpense >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
            {formatCurrency(report.totalIncome - report.totalExpense)}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4">Category Breakdown for {formatMonthLabel(selectedMonth)}</h3>
        {Object.entries(report.byCategory).length ? (
          Object.entries(report.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => (
              <div key={cat} className="flex justify-between py-3 border-b border-slate-50 text-sm">
                <span className="text-slate-500">{cat}</span>
                <span className="font-semibold text-slate-800">{formatCurrency(amt)}</span>
              </div>
            ))
        ) : (
          <p className="text-slate-400">No expenses recorded for this month.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
