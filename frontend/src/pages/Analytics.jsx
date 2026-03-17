import React, { useEffect } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const Analytics = () => {
  const { transactions, fetchTransactions } = useFinanceContext();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const categoryData = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Visual Insights</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4">Expenses by Category</h3>
          <div className="h-64">
            <Doughnut 
              data={{
                labels: Object.keys(categoryData),
                datasets: [{ data: Object.values(categoryData), backgroundColor: ['#6366f1', '#f43f5e', '#10b981', '#fbbf24'] }]
              }} 
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;