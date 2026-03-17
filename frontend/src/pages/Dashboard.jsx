import React, { useEffect } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import BalanceCard from '../components/BalanceCard';
import ChartContainer from '../components/ChartContainer';
import TransactionList from '../components/TransactionList';

const Dashboard = () => {
  const { user, transactions, fetchTransactions } = useFinanceContext();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = (user?.monthlyIncome || 0) - totalExpenses;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.username}!</h1>
        <p className="text-slate-500 text-sm">Here's what's happening with your money today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard title="Monthly Income" amount={user?.monthlyIncome} type="income" />
        <BalanceCard title="Total Expenses" amount={totalExpenses} type="expense" />
        <BalanceCard title="Remaining Balance" amount={balance} type="balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-semibold mb-4">Spending Trends</h3>
          <ChartContainer data={transactions} />
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