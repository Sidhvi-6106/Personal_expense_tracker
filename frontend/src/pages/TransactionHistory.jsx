import React, { useMemo, useState } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currencyFormatter";
import { formatDate } from "../utils/dateFormatter";
import { Search, Filter, Pencil, Trash2 } from "lucide-react";

const initialEditor = {
  _id: "",
  amount: "",
  category: "Food",
  type: "expense",
  date: "",
  description: "",
  merchant: ""
};

const TransactionHistory = () => {
  const { transactions, loading, updateTransaction, toggleTransaction } = useFinanceContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editor, setEditor] = useState(initialEditor);

  const categories = useMemo(
    () => ["All", ...new Set(transactions.map((item) => item.category).filter(Boolean))],
    [transactions]
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const text = `${t.description || ""} ${t.merchant || ""}`.toLowerCase();
        const matchesSearch = text.includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [searchTerm, selectedCategory, transactions]
  );

  const handleEdit = (transaction) => {
    setEditor({
      _id: transaction._id,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type || "expense",
      date: transaction.date?.slice(0, 10),
      description: transaction.description || "",
      merchant: transaction.merchant || ""
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const success = await updateTransaction(editor._id, editor);
    if (success) {
      setEditor(initialEditor);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction History</h1>
          <p className="text-sm text-slate-500">Search, edit, and remove entries from one place.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search description or merchant..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-72"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-medium"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {editor._id ? (
        <form onSubmit={submitEdit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-200" type="number" value={editor.amount} onChange={(e) => setEditor({ ...editor, amount: e.target.value })} required />
          <input className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-200" type="text" value={editor.category} onChange={(e) => setEditor({ ...editor, category: e.target.value })} required />
          <select className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-200" value={editor.type} onChange={(e) => setEditor({ ...editor, type: e.target.value })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-200" type="date" value={editor.date} onChange={(e) => setEditor({ ...editor, date: e.target.value })} required />
          <input className="md:col-span-1 px-3 py-2 rounded-xl border border-slate-200" type="text" placeholder="Merchant" value={editor.merchant} onChange={(e) => setEditor({ ...editor, merchant: e.target.value })} />
          <input className="md:col-span-6 px-3 py-2 rounded-xl border border-slate-200" type="text" placeholder="Description" value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} />
          <div className="md:col-span-6 flex gap-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold">Update Transaction</button>
            <button type="button" onClick={() => setEditor(initialEditor)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6 bg-slate-50/50" />
                  </tr>
                ))
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(t.date)}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{t.description || "No description"}</p>
                      <p className="text-xs text-slate-400">{t.merchant || "No merchant"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-indigo-100 text-indigo-600">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-slate-500">{t.type || "expense"}</td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === "income" ? "text-emerald-600" : "text-slate-900"}`}>
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(t)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => toggleTransaction(t._id, false)} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
