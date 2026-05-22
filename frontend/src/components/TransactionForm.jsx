import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useFinanceContext } from "../context/FinanceContext";

const categories = [
  "Food",
  "Electronics",
  "Rent",
  "Salary",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Travel",
  "Other"
];

const defaultForm = {
  amount: "",
  category: "Food",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  description: "",
  merchant: ""
};

const TransactionForm = () => {
  const { addTransaction, loading } = useFinanceContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.amount) <= 0) return;

    const success = await addTransaction(formData);
    if (success) {
      setFormData(defaultForm);
      navigate("/history");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
          <select
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (INR)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
          <select
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Transaction Date</label>
          <input
            type="date"
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Merchant</label>
          <input
            type="text"
            placeholder="Store or payer name"
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            value={formData.merchant}
            onChange={(e) => handleChange("merchant", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
        <textarea
          rows="3"
          placeholder="What did you spend on?"
          className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <button
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        {loading ? "Saving Entry..." : "Save Transaction"}
      </button>
    </form>
  );
};

export default TransactionForm;
