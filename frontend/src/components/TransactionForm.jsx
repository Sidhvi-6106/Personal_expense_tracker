import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ScanLine } from "lucide-react";
import { useFinanceContext } from "../context/FinanceContext";
import toast from "react-hot-toast";

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

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const defaultForm = {
  amount: "",
  category: "Food",
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  description: "",
  merchant: "",
  receipt: null
};

const TransactionForm = () => {
  const { addTransaction, loading, scanReceipt, scanningReceipt } = useFinanceContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleScanReceipt = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file for receipt scanning.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Receipt image must be 5 MB or smaller.");
      return;
    }

    const imageData = await readFileAsDataUrl(file);
    const scanned = await scanReceipt(imageData, file.name);
    if (!scanned) return;

    setFormData((current) => ({
      ...current,
      ...scanned,
      amount: scanned.amount || current.amount,
      category: scanned.category || current.category,
      type: scanned.type || current.type,
      date: scanned.date || current.date,
      description: scanned.description || current.description,
      merchant: scanned.merchant || current.merchant
    }));
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
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Scan Receipt</label>
          <label className="w-full p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 flex items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 transition-colors">
            <ScanLine size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">
              {scanningReceipt ? "Scanning..." : "Upload receipt image"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleScanReceipt} />
          </label>
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

      {formData.receipt?.extractedText ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-sm font-semibold text-emerald-800">Receipt extracted</p>
          <p className="text-xs text-emerald-700 mt-1 line-clamp-3">{formData.receipt.extractedText}</p>
          <p className="text-xs text-emerald-700 mt-2">
            Confidence: {typeof formData.receipt.confidence === "number" ? `${Math.round(formData.receipt.confidence * 100)}%` : "Not provided"}
          </p>
        </div>
      ) : null}

      <button
        disabled={loading || scanningReceipt}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        {loading ? "Saving Entry..." : "Save Transaction"}
      </button>
    </form>
  );
};

export default TransactionForm;
