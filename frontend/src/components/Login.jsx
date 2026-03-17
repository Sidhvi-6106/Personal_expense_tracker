import React, { useState } from 'react';
import { useFinanceContext } from '../context/FinanceContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useFinanceContext((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-indigo-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500">Log in to manage your expenses</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" 
              placeholder="name@gmail.com"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" 
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-8 text-slate-600 text-sm">
          New here? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;