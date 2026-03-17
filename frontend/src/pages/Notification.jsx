import React from 'react';
import { Bell, Info } from 'lucide-react';

const Notification = () => {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center space-y-4">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-indigo-600">
          <Bell size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">System Notifications</h2>
        <p className="text-slate-500">Live alerts will appear at the top of your screen using React Hot Toast.</p>
      </div>
      
      <div className="mt-10 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold flex items-center gap-2 mb-4">
          <Info size={18} className="text-indigo-500" />
          Recent Activity Logs
        </h3>
        <div className="text-sm text-slate-400 italic">
          Logs are cleared every time you refresh. Use the Toast system for real-time updates.
        </div>
      </div>
    </div>
  );
};
export default Notification;