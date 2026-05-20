import React, { useMemo } from "react";
import { useFinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currencyFormatter";

const Summary = () => {
  const { user, transactions, emis } = useFinanceContext();

  const summary = useMemo(() => {
    const expenses = transactions.filter((item) => item.type !== "income");
    const income = transactions.filter((item) => item.type === "income");
    const transactionSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

    const emiSpent = emis
      .filter((emi) => emi.paid)
      .reduce((sum, emi) => {
    const monthlyInstallment =(emi.loanAmount *(emi.interestRate / 12 / 100) *Math.pow(1 + emi.interestRate / 12 / 100, emi.tenureMonths)) /
      (Math.pow(1 + emi.interestRate / 12 / 100, emi.tenureMonths) - 1);
      return sum + monthlyInstallment;}, 0);

    const totalSpent = transactionSpent + emiSpent;
    const incomeTotal = income.reduce((sum, item) => sum + item.amount,0);

    const totalIncome = (user?.monthlyIncome || 0) + incomeTotal;
    return {
      totalSpent,
      totalIncome,
      balance: totalIncome - totalSpent
    };
  }, [transactions, emis, user?.monthlyIncome]);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Net Savings</p>
          <h1 className="text-5xl font-bold">{formatCurrency(summary.balance)}</h1>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm italic">
              Monthly Income: {formatCurrency(summary.totalIncome)}
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-sm italic">
              Total Expenses: {formatCurrency(summary.totalSpent)}
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20" />
      </div>
    </div>
  );
};

export default Summary;