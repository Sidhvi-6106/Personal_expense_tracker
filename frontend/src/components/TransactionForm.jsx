// // import React, { useState } from 'react';
// // import { PlusCircle } from 'lucide-react';
// // import { useFinanceContext } from '../context/FinanceContext';

// // const TransactionForm = () => {
// //   const [data, setData] = useState({ amount: '', category: 'Food', date: '', description: '' });
// //   const addTransaction = useFinanceContext((state) => state.addTransaction);

// //   const categories = ["Food", "Rent", "Salary", "Shopping", "Entertainment", "Health", "Other"];

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     await addTransaction(data);
// //     setData({ amount: '', category: 'Food', date: '', description: '' });
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //         <div>
// //           <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount</label>
// //           <input type="number" value={data.amount} className="w-full px-4 py-2 rounded-lg border bg-slate-50 border-slate-200 outline-none" 
// //             onChange={(e) => setData({...data, amount: e.target.value})} required />
// //         </div>
// //         <div>
// //           <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
// //           <select value={data.category} className="w-full px-4 py-2 rounded-lg border bg-slate-50 border-slate-200 outline-none"
// //             onChange={(e) => setData({...data, category: e.target.value})}>
// //             {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
// //           </select>
// //         </div>
// //       </div>
// //       <div>
// //         <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
// //         <input type="text" value={data.description} className="w-full px-4 py-2 rounded-lg border bg-slate-50 border-slate-200 outline-none"
// //           onChange={(e) => setData({...data, description: e.target.value})} />
// //       </div>
// //       <button className="flex items-center justify-center space-x-2 w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all">
// //         <PlusCircle size={18} />
// //         <span>Add Transaction</span>
// //       </button>
// //     </form>
// //   );
// // };

// // export default TransactionForm;
// import React, { useState } from 'react';
// import { useFinanceContext } from '../context/FinanceContext';
// import { useNavigate } from 'react-router-dom';

// const TransactionForm = () => {
//   const addTransaction = useFinanceContext((state) => state.addTransaction);
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     amount: '',
//     category: 'Food',
//     date: new Date().toISOString().split('T')[0],
//     description: ''
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const success = await addTransaction(formData);
//     if (success) {
//       navigate('/history'); // Redirect to history to see the new entry
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
//         <input 
//           type="number" 
//           required
//           className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
//           value={formData.amount}
//           onChange={(e) => setFormData({...formData, amount: e.target.value})}
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
//         <select 
//           className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
//           value={formData.category}
//           onChange={(e) => setFormData({...formData, category: e.target.value})}
//         >
//           <option>Food</option>
//           <option>Electronics</option>
//           <option>Rent</option>
//           <option>Salary</option>
//           <option>Shopping</option>
//         </select>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
//         <input 
//           type="date" 
//           className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
//           value={formData.date}
//           onChange={(e) => setFormData({...formData, date: e.target.value})}
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
//         <input 
//           type="text" 
//           placeholder="e.g. earpods purchased"
//           className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
//           value={formData.description}
//           onChange={(e) => setFormData({...formData, description: e.target.value})}
//         />
//       </div>
//       <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
//         Save Transaction
//       </button>
//     </form>
//   );
// };

// export default TransactionForm;
import React, { useState } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const TransactionForm = () => {
  const { addTransaction, loading } = useFinanceContext();
  const navigate = useNavigate();
  
  const categories = ["Food", "Electronics", "Rent", "Salary", "Shopping", "Entertainment", "Health", "Utilities", "Travel"];

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic Validation
    if (formData.amount <= 0) return;

    const success = await addTransaction(formData);
    if (success) {
      navigate('/history');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            required
            placeholder="0.00"
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
          <select 
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction Date</label>
        <input 
          type="date" 
          className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
        <textarea 
          rows="2"
          placeholder="What did you spend on?"
          className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <button 
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        {loading ? 'Saving Entry...' : 'Save Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;