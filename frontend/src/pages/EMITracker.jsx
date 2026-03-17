import React from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { CreditCard, Car, Smartphone, Landmark } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';
// import { cn } from '../utils/cn';

const EMITracker = () => {
  const transactions = useFinanceContext((state) => state.transactions);

  // Filter specifically for EMI and Loan keywords
  const emis = transactions.filter(t => 
    t.category.toLowerCase().includes('emi') || 
    t.description?.toLowerCase().includes('loan')
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Loan & EMI Tracker</h1>
          <p className="text-slate-500 text-sm">Keep track of your active financial installments.</p>
        </div>
        <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl">
          <Landmark size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emis.length > 0 ? emis.map((emi) => (
          <div key={emi._id} className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Active Installment</p>
                <h3 className="text-xl font-bold mb-4">{emi.description || 'General EMI'}</h3>
                <p className="text-3xl font-bold text-indigo-400">{formatCurrency(emi.amount)}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <CreditCard size={20} className="text-white" />
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-xs text-slate-400 border-t border-white/10 pt-4">
              <span>Next Due: Auto-calculated</span>
            </div>

            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500"></div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-slate-400 italic">No EMI records found. Add a transaction with "EMI" to track it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EMITracker;