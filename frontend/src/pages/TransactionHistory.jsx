// // import React, { useState } from 'react';
// // import { useFinanceContext } from '../context/FinanceContext';
// // import { Search } from 'lucide-react';
// // import TransactionList from '../components/TransactionList';

// // const TransactionHistory = () => {
// //   const [query, setQuery] = useState("");
  
// //   return (
// //     <div className="space-y-6">
// //       <div className="flex justify-between items-center">
// //         <h1 className="text-2xl font-bold text-slate-800">History</h1>
// //         <div className="relative">
// //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
// //           <input 
// //             type="text" 
// //             placeholder="Search transactions..."
// //             className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
// //             onChange={(e) => setQuery(e.target.value)}
// //           />
// //         </div>
// //       </div>
      
// //       <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
// //         <TransactionList filter={query} />
// //       </div>
// //     </div>
// //   );
// // };

// // export default TransactionHistory;
// import React, { useEffect } from 'react';
// import { useFinanceContext } from '../context/FinanceContext';
// import { formatCurrency } from '../utils/currencyFormatter';
// import { formatDate } from '../utils/dateFormatter';

// const TransactionHistory = () => {
//   const { transactions, fetchTransactions, loading } = useFinanceContext();

//   useEffect(() => {
//     fetchTransactions(); // Fetch data when page loads
//   }, []);

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
      
//       <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//         <table className="w-full text-left">
//           <thead className="bg-slate-50">
//             <tr className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
//               <th className="px-6 py-4">Date</th>
//               <th className="px-6 py-4">Description</th>
//               <th className="px-6 py-4">Category</th>
//               <th className="px-6 py-4 text-right">Amount</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {transactions.map((t) => (
//               <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
//                 <td className="px-6 py-4 text-slate-600">{formatDate(t.date)}</td>
//                 <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
//                 <td className="px-6 py-4">
//                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase">
//                     {t.category}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 text-right font-bold text-slate-900">
//                   {formatCurrency(t.amount)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {transactions.length === 0 && !loading && (
//           <div className="p-10 text-center text-slate-400 italic">No transactions found.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransactionHistory;
import React, { useEffect, useState } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormatter';
import { Search, Filter, Trash2 } from 'lucide-react';

const TransactionHistory = () => {
  const { transactions, fetchTransactions, loading } = useFinanceContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter Logic: Search by description AND filter by category
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
        
        <div className="flex flex-wrap gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search description..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-medium"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Electronics">Electronics</option>
            <option value="Salary">Salary</option>
            <option value="Rent">Rent</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton Loader
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-6 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : filteredTransactions.map((t) => (
                <tr key={t._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{t.description || "No description"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      t.category === 'Salary' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    t.category === 'Salary' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {t.category === 'Salary' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && !loading && (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Filter className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No transactions match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;