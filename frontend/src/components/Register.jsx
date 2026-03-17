import React, { useState } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', number: '', monthlyIncome: '' });
  const register = useFinanceContext((state) => state.register); // Assumes you add a register function to Zustand
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic to call backend API
      navigate('/login');
    } catch (err) { alert("Registration failed"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500">Start tracking your expenses today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Username" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <input type="number" placeholder="Monthly Income" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})} required />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6 text-slate-600 text-sm">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;