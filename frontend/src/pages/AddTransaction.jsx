import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';

const AddTransaction = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white">
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add Transaction</h1>
            <p className="text-slate-500 text-sm">Record a new expense or income entry.</p>
          </div>
        </div>
        
        <TransactionForm />
      </div>
    </div>
  );
};

export default AddTransaction;