import React from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { BellRing, Droplets, Zap, Wifi, Home } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';
// import { cn } from '../utils/cn';

const BillReminder = () => {
  const transactions = useFinanceContext((state) => state.transactions);

  // Filter for common monthly utility categories
  const utilityBills = transactions.filter(t => 
    ['electricity', 'water', 'internet', 'rent', 'utilities'].includes(t.category.toLowerCase())
  );

  const getIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'electricity': return <Zap size={20} />;
      case 'water': return <Droplets size={20} />;
      case 'internet': return <Wifi size={20} />;
      case 'rent': return <Home size={20} />;
      default: return <BellRing size={20} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Utility Reminders</h1>
        <p className="text-slate-500 text-sm">Manage your monthly recurring service bills.</p>
      </div>

      <div className="grid gap-4">
        {utilityBills.length > 0 ? utilityBills.map((bill) => (
          <div key={bill._id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                {getIcon(bill.category)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 capitalize">{bill.category}</h3>
                <p className="text-xs text-slate-400">Last paid: {new Date(bill.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{formatCurrency(bill.amount)}</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Monthly</span>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 italic">No utility bills found in your history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillReminder;