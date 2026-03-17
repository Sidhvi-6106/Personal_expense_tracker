// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import RootLayout from './components/RootLayout';
// import Dashboard from './pages/Dashboard';
// import Login from './components/Login';
// import Register from './components/Register';
// import { useFinanceContext } from './context/FinanceContext';
// import { Toaster } from 'react-hot-toast';

// const App = () => {
//   const token = useFinanceContext((state) => state.token);

//   return (
//     <BrowserRouter>
//     <Toaster position="top-center" reverseOrder={false} />
//       <Routes>
//         <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

//         {/* <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} /> */}
//         <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
        
//         <Route element={token ? <RootLayout /> : <Navigate to="/login" />}>
//           <Route path="/" element={<Dashboard />} />
//           {/* Add other pages like /history, /analytics etc here */}
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import TransactionHistory from "./pages/TransactionHistory";
import Analytics from "./pages/Analytics";
import EMITracker from "./pages/EMITracker";
import BillRemainder from "./pages/BillRemainder";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import Reports from "./pages/Reports";
import Summary from "./pages/Summary";
import Notification from "./pages/Notification";
import Login from "./components/Login";
import Register from "./components/Register";


const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "add-transaction", element: <AddTransaction /> },
      { path: "history", element: <TransactionHistory /> },
      { path: "analytics", element: <Analytics /> },
      { path: "emi-tracker", element: <EMITracker /> },
      { path: "bill-remainder", element: <BillRemainder /> },
      { path: "profile", element: <Profile /> },
      { path: "setting", element: <Setting /> },
      { path: "reports", element: <Reports /> },
      { path: "summary", element: <Summary /> },
      { path: "notifications", element: <Notification /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

