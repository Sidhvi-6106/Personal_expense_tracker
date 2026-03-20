import React, { useEffect, useMemo } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { formatCurrency } from "../utils/currencyFormatter";

ChartJS.register(...registerables);

const monthKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const Analytics = () => {
  const { transactions, fetchTransactions, fetchAIInsights, aiInsights, user } = useFinanceContext();

  useEffect(() => {
    fetchTransactions();
    fetchAIInsights();
  }, [fetchAIInsights, fetchTransactions]);

  const analytics = useMemo(() => {
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

    const monthlyBuckets = expensesOnly.reduce((acc, item) => {
      const key = monthKey(item.date);
      acc[key] = (acc[key] || 0) + item.amount;
      return acc;
    }, {});

    const recentMonths = Object.entries(monthlyBuckets).sort((a, b) => a[0].localeCompare(b[0])).slice(-3);
    const predictedNextMonth = recentMonths.length
      ? recentMonths.reduce((sum, [, amount]) => sum + amount, 0) / recentMonths.length
      : 0;

    const currentMonthExpense = monthlyBuckets[monthKey(new Date())] || 0;
    const budget = user?.monthlyIncome || 0;
    const budgetUsage = budget ? currentMonthExpense / budget : 0;

    return {
      expenses: expensesOnly.reduce((sum, item) => sum + item.amount, 0),
      income: incomeOnly.reduce((sum, item) => sum + item.amount, 0),
      categoryData: categories,
      trendLabels: Object.keys(trends),
      trendValues: Object.values(trends),
      predictedNextMonth,
      currentMonthExpense,
      budgetUsage
    };
  }, [transactions, user?.monthlyIncome]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visual Insights</h1>
        <p className="text-sm text-slate-500">See category splits, spending trends, AI suggestions, and next-month prediction in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Income</p>
          <h2 className="text-3xl font-bold text-emerald-600 mt-2">{formatCurrency(analytics.income)}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(analytics.expenses)}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">This Month</p>
          <h2 className="text-3xl font-bold text-indigo-600 mt-2">{formatCurrency(analytics.currentMonthExpense)}</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Predicted Next Month</p>
          <h2 className="text-3xl font-bold text-amber-600 mt-2">{formatCurrency(analytics.predictedNextMonth)}</h2>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Budget Usage</h3>
          <span className={`text-sm font-semibold ${analytics.budgetUsage >= 1 ? "text-rose-600" : analytics.budgetUsage >= 0.8 ? "text-amber-600" : "text-emerald-600"}`}>
            {Math.round(analytics.budgetUsage * 100 || 0)}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${analytics.budgetUsage >= 1 ? "bg-rose-500" : analytics.budgetUsage >= 0.8 ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(analytics.budgetUsage * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4">Expenses by Category</h3>
          <div className="h-72">
            <Doughnut
              data={{
                labels: Object.keys(analytics.categoryData),
                datasets: [
                  {
                    data: Object.values(analytics.categoryData),
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
                labels: analytics.trendLabels,
                datasets: [
                  {
                    label: "Expense",
                    data: analytics.trendValues,
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
