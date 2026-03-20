import React, { useEffect, useMemo } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { formatCurrency } from "../utils/currencyFormatter";

ChartJS.register(...registerables);

const Analytics = () => {
  const { transactions, fetchTransactions, fetchAIInsights, aiInsights } = useFinanceContext();

  useEffect(() => {
    fetchTransactions();
    fetchAIInsights();
  }, [fetchAIInsights, fetchTransactions]);

  const { expenses, income, categoryData, trendLabels, trendValues } = useMemo(() => {
    const expensesOnly = transactions.filter((item) => item.type !== "income");
    const incomeOnly = transactions.filter((item) => item.type === "income");

    const categories = expensesOnly.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    const trends = expensesOnly
      .slice()
      .reverse()
      .reduce((acc, item) => {
        const key = new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        acc[key] = (acc[key] || 0) + item.amount;
        return acc;
      }, {});

    return {
      expenses: expensesOnly.reduce((sum, item) => sum + item.amount, 0),
      income: incomeOnly.reduce((sum, item) => sum + item.amount, 0),
      categoryData: categories,
      trendLabels: Object.keys(trends),
      trendValues: Object.values(trends)
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visual Insights</h1>
        <p className="text-sm text-slate-500">See category splits, spending trends, and AI-generated suggestions in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Income</p>
          <h2 className="text-3xl font-bold text-emerald-600 mt-2">{formatCurrency(income)}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(expenses)}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Net Balance</p>
          <h2 className={`text-3xl font-bold mt-2 ${(income - expenses) >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
            {formatCurrency(income - expenses)}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4">Expenses by Category</h3>
          <div className="h-72">
            <Doughnut
              data={{
                labels: Object.keys(categoryData),
                datasets: [
                  {
                    data: Object.values(categoryData),
                    backgroundColor: ["#4f46e5", "#0f766e", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"]
                  }
                ]
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4">Spending Trend</h3>
          <div className="h-72">
            <Line
              data={{
                labels: trendLabels,
                datasets: [
                  {
                    label: "Expense",
                    data: trendValues,
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79,70,229,0.15)",
                    tension: 0.35,
                    fill: true
                  }
                ]
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-200 font-semibold">AI suggestions</p>
        <h3 className="text-2xl font-bold mt-2">How to manage expenses better</h3>
        {aiInsights?.summary ? <p className="text-slate-300 mt-3">{aiInsights.summary}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {(aiInsights?.suggestions || ["Add a few transactions to unlock suggestions."]).map((item, index) => (
            <div key={index} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
