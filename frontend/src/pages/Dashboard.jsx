import React, { useMemo } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import BalanceCard from "../components/BalanceCard";
import ChartContainer from "../components/ChartContainer";
import TransactionList from "../components/TransactionList";

const Dashboard = () => {
  const { user, transactions } = useFinanceContext();

  const { totalExpenses, totalIncome, balance } = useMemo(() => {
    const expenseTotal = transactions
      .filter((item) => item.type !== "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const incomeTotal = transactions
      .filter((item) => item.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalExpenses: expenseTotal,
      totalIncome: incomeTotal || user?.monthlyIncome || 0,
      balance: (incomeTotal || user?.monthlyIncome || 0) - expenseTotal
    };
  }, [transactions, user?.monthlyIncome]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.username}!</h1>
        <p className="text-slate-500 text-sm">Your dashboard updates automatically when transactions are added or edited.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard title="Monthly Income" amount={totalIncome} type="income" />
        <BalanceCard title="Total Expenses" amount={totalExpenses} type="expense" />
        <BalanceCard title="Remaining Balance" amount={balance} type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-semibold mb-4">Spending Trends</h3>
          <ChartContainer transactions={transactions.filter((item) => item.type !== "income")} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <TransactionList limit={5} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
