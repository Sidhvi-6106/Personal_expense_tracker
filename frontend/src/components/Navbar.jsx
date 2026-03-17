import React from 'react';
import { User, Bell } from 'lucide-react';
import { useFinanceContext } from '../context/FinanceContext';

const Navbar = () => {
  const user = useFinanceContext((state) => state.user);

  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-2">
        <span className="text-slate-400 text-sm">Pages</span>
        <span className="text-slate-400 text-sm">/</span>
        <span className="text-slate-800 text-sm font-medium capitalize">
          {window.location.pathname.replace('/', '') || 'Dashboard'}
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2" />
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{user?.username}</p>
            <p className="text-xs text-slate-400 mt-1">Premium Plan</p>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;