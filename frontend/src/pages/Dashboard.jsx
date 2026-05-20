import React, { useMemo } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import BalanceCard from "../components/BalanceCard";
import ChartContainer from "../components/ChartContainer";
import TransactionList from "../components/TransactionList";

const Dashboard = () => {
  const { user, transactions, notifications, emis } = useFinanceContext();

  // Convert paid EMIs into transaction-like objects
  const emiTransactions = useMemo(() => {
    return emis
      .filter((emi) => emi.paid)
      .map((emi) => {
        const monthlyInstallment =
          (emi.loanAmount *
            (emi.interestRate / 12 / 100) *
            Math.pow(1 + emi.interestRate / 12 / 100, emi.tenureMonths)) /
          (Math.pow(1 + emi.interestRate / 12 / 100, emi.tenureMonths) - 1);

        return {
          _id: `emi-${emi._id}`,
          amount: monthlyInstallment,
          category: "EMI",
          type: "expense",
          date: emi.paymentDate || new Date(),
          merchant: "Loan EMI",
          description: "Monthly EMI Payment"
        };
      });
  }, [emis]);

  // Merge normal transactions + EMI transactions
  const allTransactions = useMemo(() => {
    return [...transactions, ...emiTransactions];
  }, [transactions, emiTransactions]);

  const {
    totalExpenses,
    totalIncome,
    balance,
    currentMonthExpense,
    budgetUsage
  } = useMemo(() => {

    // Total Expenses
    const expenseTotal = allTransactions
      .filter((item) => item.type !== "income")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // Extra Income Transactions
    const incomeTotal = allTransactions
      .filter((item) => item.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // Monthly Income + Added Income Transactions
    const finalIncome = (user?.monthlyIncome || 0) + incomeTotal;

    // Current Month Expenses
    const currentMonthExpense = allTransactions
      .filter(
        (item) =>
          item.type !== "income" &&
          new Date(item.date).getMonth() === new Date().getMonth() &&
          new Date(item.date).getFullYear() === new Date().getFullYear()
      )
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return {
      totalExpenses: expenseTotal,
      totalIncome: finalIncome,
      balance: finalIncome - expenseTotal,
      currentMonthExpense,

      budgetUsage: user?.monthlyIncome
        ? currentMonthExpense / user.monthlyIncome
        : 0
    };
  }, [allTransactions, user?.monthlyIncome]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.username}!
        </h1>

        <p className="text-slate-500 text-sm">
          Your dashboard updates automatically when transactions are added or edited.
        </p>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          title="Monthly Income"
          amount={totalIncome}
          type="income"
        />

        <BalanceCard
          title="Total Expenses"
          amount={totalExpenses}
          type="expense"
        />

        <BalanceCard
          title="Remaining Balance"
          amount={balance}
          type="balance"
        />
      </div>

      {/* Budget + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-6">

        {/* Budget Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              This Month Budget Status
            </h3>

            <span
              className={`text-sm font-semibold ${
                budgetUsage >= 1
                  ? "text-rose-600"
                  : budgetUsage >= 0.8
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {Math.round(budgetUsage * 100 || 0)}%
            </span>
          </div>

          <p className="text-sm text-slate-500 mb-3">
            Spent this month:{" "}
            {currentMonthExpense.toLocaleString("en-IN")} out of{" "}
            {(user?.monthlyIncome || 0).toLocaleString("en-IN")}
          </p>

          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${
                budgetUsage >= 1
                  ? "bg-rose-500"
                  : budgetUsage >= 0.8
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(budgetUsage * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

          <h3 className="font-semibold mb-4">
            Latest Alerts
          </h3>

          {notifications.length ? (
            notifications.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="py-3 border-b border-slate-50"
              >
                <p className="font-medium text-slate-800">
                  {item.title}
                </p>

                <p className="text-sm text-slate-500">
                  {item.message}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No active alerts.
            </p>
          )}
        </div>
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">

        {/* Spending Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

          <h3 className="font-semibold mb-4">
            Spending Trends
          </h3>

          <ChartContainer
            transactions={allTransactions.filter(
              (item) => item.type !== "income"
            )}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

          <h3 className="font-semibold mb-4">
            Recent Activity
          </h3>

          <TransactionList
            limit={5}
            transactions={allTransactions}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;