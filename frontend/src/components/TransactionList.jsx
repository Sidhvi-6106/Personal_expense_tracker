import React from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currencyFormatter";
import { formatDate } from "../utils/dateFormatter";

const TransactionList = ({ limit, transactions: propTransactions }) => {
  const { transactions: contextTransactions } = useFinanceContext();

  // Use passed transactions if available
  const transactions = propTransactions || contextTransactions;

  // Sort latest first
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const displayedTransactions = limit
    ? sortedTransactions.slice(0, limit)
    : sortedTransactions;

  if (!displayedTransactions.length) {
    return (
      <div className="text-center py-10 text-slate-400">
        No transactions available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedTransactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"
        >
          <div>
            <h4 className="font-semibold text-slate-800">
              {transaction.description || "No Description"}
            </h4>

            <div className="flex gap-2 text-sm text-slate-500 mt-1">
              <span>{transaction.category}</span>
              <span>•</span>
              <span>{formatDate(transaction.date)}</span>
            </div>

            {transaction.merchant && (
              <p className="text-xs text-slate-400 mt-1">
                {transaction.merchant}
              </p>
            )}
          </div>

          <div
            className={`font-bold text-lg ${
              transaction.type === "income"
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;