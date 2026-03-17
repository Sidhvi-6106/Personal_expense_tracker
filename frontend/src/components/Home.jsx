// import React from 'react';
// import { useFinanceContext } from '../context/FinanceContext';
// import { TrendingUp, Wallet } from 'lucide-react';

// const Home = () => {
//   const user = useFinanceContext((state) => state.user);
//   return (
//     <div className="bg-gradient from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl mb-8">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Hello, {user?.username}! 👋</h1>
//           <p className="mt-2 text-indigo-100 opacity-90">You've saved 12% more than last month. Keep it up!</p>
//         </div>
//         <div className="hidden md:block bg-white/10 p-4 rounded-2xl backdrop-blur-md">
//           <TrendingUp size={40} />
//         </div>
//       </div>
//     </div>
//   );
// };
// export default Home;
import React, { useEffect } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { BrainCircuit, Sparkles, TrendingDown, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/currencyFormatter';

const Home = () => {
  const { user, aiInsights, fetchAIStats, transactions } = useFinanceContext();

  useEffect(() => {
    fetchAIStats();
  }, []);

  // Fallback data if AI API is still warming up
  const stats = aiInsights || {
    healthScore: 78,
    prediction: 0,
    anomaly: "None detected",
    tip: "Analyze your subscriptions to save more."
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Welcome */}
      <div className="bg-gradient from-indigo-700 via-violet-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
          <p className="text-indigo-100 mt-2 opacity-80">Your AI-powered financial assistant has analyzed your latest spending.</p>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-indigo-200">AI Health Score</p>
              <p className="text-2xl font-bold">{stats.healthScore}/100</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] uppercase font-bold text-indigo-200">Next Month Est.</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.prediction)}</p>
            </div>
          </div>
        </div>
        <BrainCircuit className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Anomaly Detection Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Smart Alerts</h3>
          </div>
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-2xl border flex items-center justify-between",
              stats.anomaly === "None detected" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
            )}>
              <span className="text-sm font-medium text-slate-700">{stats.anomaly}</span>
              <Zap size={16} className={stats.anomaly === "None detected" ? "text-emerald-500" : "text-rose-500"} />
            </div>
          </div>
        </div>

        {/* AI Recommendation Card */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="text-indigo-600" size={20} />
            <h3 className="font-bold text-indigo-900">AI Tip</h3>
          </div>
          <p className="text-indigo-700 text-sm leading-relaxed relative z-10">
            "{stats.tip}"
          </p>
          <div className="mt-6">
            <button className="text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              View Detailed Plan
            </button>
          </div>
        </div>

      </div>

      {/* Mini Recent History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           Recent Activity 
           <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-widest">Live</span>
        </h2>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          {transactions.slice(0, 3).map((t) => (
            <div key={t._id} className="flex justify-between items-center p-5 border-b last:border-0 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                  {t.category[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{t.category}</p>
                </div>
              </div>
              <p className="font-bold text-slate-900">{formatCurrency(t.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;