import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartContainer = ({ transactions = [] }) => {
  // Group transactions by category
  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const options = {
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
    }
  };

  return (
    <div className="h-52 max-w-sm mx-auto flex items-center justify-center">
      {transactions.length > 0 ? <Doughnut data={data} options={options} /> : <p className="text-slate-400">No data to display</p>}
    </div>
  );
};

export default ChartContainer;
