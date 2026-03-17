// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { LayoutDashboard, History, Bell, PieChart, User, Settings, LogOut } from 'lucide-react';
// import { useFinanceContext } from '../context/FinanceContext';

// const Sidebar = () => {
//   const logout = useFinanceContext((state) => state.logout);

//   const menuItems = [
//     { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
//     { icon: History, label: 'History', path: '/history' },
//     { icon: PieChart, label: 'Analytics', path: '/analytics' },
//     { icon: Bell, label: 'Bill Reminders', path: '/reminders' },
//     { icon: User, label: 'Profile', path: '/profile' },
//   ];

//   return (
//     <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
//       <div className="p-6">
//         <h2 className="text-xl font-bold text-indigo-600 tracking-tight">SpendWise</h2>
//       </div>
      
//       <nav className="flex-1 px-4 space-y-2">
//         {menuItems.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
//           >
//             <item.icon size={20} />
//             <span>{item.label}</span>
//           </NavLink>
//         ))}
//       </nav>

//       <button 
//         onClick={logout}
//         className="p-6 flex items-center space-x-3 text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
//       >
//         <LogOut size={20} />
//         <span>Logout</span>
//       </button>
//     </aside>
//   );
// };

// export default Sidebar;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  PlusCircle, 
  History, 
  PieChart, 
  Calculator, 
  Bell, 
  FileText, 
  BellRing, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useFinanceContext } from '../context/FinanceContext';

const Sidebar = () => {
  const logout = useFinanceContext((state) => state.logout);

  // Grouped Menu Items for better organization
  const menuGroups = [
    {
      group: "Main",
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: BarChart3, label: 'Summary', path: '/summary' },
      ]
    },
    {
      group: "Transactions",
      items: [
        { icon: PlusCircle, label: 'Add Transaction', path: '/add-transaction' },
        { icon: History, label: 'Transaction History', path: '/history' },
      ]
    },
    {
      group: "Analysis",
      items: [
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: Calculator, label: 'EMI Tracker', path: '/emi-tracker' },
        { icon: FileText, label: 'Reports', path: '/reports' },
      ]
    },
    {
      group: "Reminders",
      items: [
        { icon: Bell, label: 'Bill Reminder', path: '/reminders' },
        { icon: BellRing, label: 'Notifications', path: '/notifications' },
      ]
    },
    {
      group: "Account",
      items: [
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto">
      <div className="p-6 sticky top-0 bg-white z-10 flex gap-4">
        <img src="https://static.vecteezy.com/system/resources/previews/012/080/828/non_2x/number-17-line-modern-creative-business-logo-free-vector.jpg" width={40}className='rounded-full' alt="" />
        <h2 className="text-2xl font-bold text-indigo-600 tracking-tight ">Exp Tracker</h2>
      </div>
      
      <nav className="flex-1 px-4 pb-6 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {group.group}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;