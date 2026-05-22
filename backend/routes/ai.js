import exp from "express";
import Groq from "groq-sdk";
import EMI from "../models/EMI.js";
import BillReminder from "../models/BillReminder.js";
import Transaction from "../models/Transaction.js";
import { checkUser } from "../middleware/checkUser.js";
import dotenv from "dotenv";

dotenv.config();

export const aiRouter = exp.Router();

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const formatMoney = (amount) =>
  `Rs.${Math.round(Number(amount || 0)).toLocaleString("en-IN")}`;

const calculateEMI = (principal, annualRate, months) => {
  const loanAmount = Number(principal || 0);
  const tenureMonths = Number(months || 0);
  const monthlyRate = Number(annualRate || 0) / 12 / 100;

  if (!loanAmount || !tenureMonths) return 0;
  if (!monthlyRate) return loanAmount / tenureMonths;

  return (
    loanAmount *
    monthlyRate *
    Math.pow(1 + monthlyRate, tenureMonths)
  ) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
};

const getDaysUntil = (dateValue) => {
  const today = new Date();
  const target = new Date(dateValue);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const extractJson = (text) => {
  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]);
};

const buildHeuristicSuggestions = ({ monthlyIncome, transactions }) => {
  const expenses = transactions.filter((item) => item.type !== "income");
  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const categoryTotals = {};

  expenses.forEach((item) => {
    const category = item.category || "Other";
    categoryTotals[category] =
      (categoryTotals[category] || 0) + Number(item.amount || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );
  const topCategory = sortedCategories[0];
  const suggestions = [];
  const risks = [];

  if (!transactions.length) {
    suggestions.push("Add transactions regularly to receive better financial insights.");
  }

  if (monthlyIncome > 0) {
    const usage = totalExpense / monthlyIncome;
    if (usage >= 1) {
      risks.push("Your expenses are higher than your monthly income.");
      suggestions.push("Reduce non-essential spending immediately.");
    } else if (usage >= 0.8) {
      risks.push("You have already used more than 80% of your monthly budget.");
      suggestions.push("Set a spending limit for the remaining days of the month.");
    }
  }

  if (topCategory) {
    suggestions.push(`${topCategory[0]} is your highest spending category.`);
  }

  const foodExpenses = expenses.filter(
    (item) => item.category && item.category.toLowerCase() === "food"
  );
  if (foodExpenses.length >= 5) {
    suggestions.push("Frequent food spending detected. Try weekly meal planning.");
  }

  if (!suggestions.length) {
    suggestions.push("Your spending pattern currently looks healthy.");
  }

  return {
    summary:
      totalExpense > monthlyIncome
        ? "Your expenses are exceeding your income."
        : "Your finances look fairly balanced.",
    suggestions,
    risks
  };
};

const buildChatbotFallback = ({
  message,
  monthlyIncome,
  totalExpenses,
  totalIncome,
  netSavings,
  totalMonthlyEMI,
  monthlyBillBurden,
  transactions,
  emiList,
  billList,
  unpaidBills,
  overdueBills,
  categoryTotals,
  topCategory
}) => {
  const lowerMessage = String(message).toLowerCase();
  const wantsBills = /bill|reminder|due|utility|utilities|rent|subscription/.test(
    lowerMessage
  );
  const wantsEmi = /emi|loan|installment/.test(lowerMessage);
  const wantsTransaction = /transaction|expense|spend|income|category/.test(
    lowerMessage
  );

  if (wantsBills) {
    if (!billList.length) {
      return "You do not have any active bill reminders yet.";
    }

    const billLines = billList.slice(0, 6).map((bill) => {
      const days = getDaysUntil(bill.dueDate);
      const status =
        days < 0
          ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`
          : days === 0
            ? "due today"
            : `due in ${days} day${days === 1 ? "" : "s"}`;

      return `${bill.title} (${bill.category}) is ${formatMoney(bill.amount)}, ${bill.frequency}, ${status}.`;
    });

    return [
      `You have ${billList.length} active bill reminder${billList.length === 1 ? "" : "s"}.`,
      `Unpaid: ${unpaidBills.length}. Overdue: ${overdueBills.length}. Monthly bill burden: ${formatMoney(monthlyBillBurden)}.`,
      ...billLines
    ].join("\n");
  }

  if (wantsEmi) {
    if (!emiList.length) {
      return "You do not have any active EMI records yet.";
    }

    return [
      `You have ${emiList.length} active EMI record${emiList.length === 1 ? "" : "s"}.`,
      `Estimated monthly EMI burden: ${formatMoney(totalMonthlyEMI)}.`,
      `Paid EMIs: ${emiList.filter((emi) => emi.paid).length}. Unpaid EMIs: ${emiList.filter((emi) => !emi.paid).length}.`
    ].join("\n");
  }

  if (wantsTransaction) {
    return [
      `You have ${transactions.length} transaction${transactions.length === 1 ? "" : "s"} recorded.`,
      `Total expenses: ${formatMoney(totalExpenses)}. Income from transactions: ${formatMoney(totalIncome)}.`,
      `Top spending category: ${topCategory?.[0] || "N/A"} (${formatMoney(topCategory?.[1] || 0)}).`,
      `Category spending: ${JSON.stringify(categoryTotals)}`
    ].join("\n");
  }

  return [
    `Here is your finance summary: monthly income ${formatMoney(monthlyIncome)}, expenses ${formatMoney(totalExpenses)}, EMI burden ${formatMoney(totalMonthlyEMI)}, monthly bill burden ${formatMoney(monthlyBillBurden)}.`,
    `Estimated net savings after these commitments: ${formatMoney(netSavings)}.`,
    "Ask me specifically about bills, EMIs, expenses, income, or categories for a detailed breakdown."
  ].join("\n");
};

const isFinanceProjectQuestion = (message = "") =>
  /finance|expense|expenses|income|salary|budget|transaction|transactions|spend|spending|emi|loan|installment|bill|bills|reminder|due|utility|utilities|rent|subscription|category|saving|savings|profile|account|password|dashboard|report|analytics|summary|notification|notifications/i.test(
    message
  );

const getUserFinanceData = async (userId) => {
  const [transactions, emiList, billList] = await Promise.all([
    Transaction.find({
      userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).sort({ date: -1 }),
    EMI.find({
      userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).sort({ dueDate: 1, createdAt: -1 }),
    BillReminder.find({
      userId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }]
    }).sort({ dueDate: 1, createdAt: -1 })
  ]);

  const expenseTransactions = transactions.filter((item) => item.type !== "income");
  const incomeTransactions = transactions.filter((item) => item.type === "income");
  const totalExpenses = expenseTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalIncome = incomeTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalMonthlyEMI = emiList.reduce(
    (sum, item) => sum + calculateEMI(item.loanAmount, item.interestRate, item.tenureMonths),
    0
  );
  const monthlyBillBurden = billList
    .filter((bill) => bill.frequency === "Monthly")
    .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const totalBillAmount = billList.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0
  );
  const unpaidBills = billList.filter((bill) => !bill.paid);
  const overdueBills = unpaidBills.filter((bill) => getDaysUntil(bill.dueDate) < 0);

  const categoryTotals = {};
  expenseTransactions.forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + Number(item.amount || 0);
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return {
    transactions,
    emiList,
    billList,
    expenseTransactions,
    incomeTransactions,
    totalExpenses,
    totalIncome,
    totalMonthlyEMI,
    monthlyBillBurden,
    totalBillAmount,
    unpaidBills,
    overdueBills,
    categoryTotals,
    topCategory
  };
};

aiRouter.get("/suggestions", checkUser, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      isActive: true
    })
      .sort({ date: -1 })
      .limit(30);

    const monthlyIncome = req.user.monthlyIncome || 0;
    const heuristic = buildHeuristicSuggestions({ monthlyIncome, transactions });

    if (!groq) {
      return res.status(200).json({
        message: "Fallback suggestions generated",
        payload: { ...heuristic, source: "heuristic" }
      });
    }

    const simplifiedTransactions = transactions.map((item) => ({
      amount: item.amount,
      category: item.category,
      type: item.type,
      merchant: item.merchant,
      date: item.date
    }));

    const prompt = `
Analyze the user's transactions and monthly income.
Return ONLY valid JSON with this format:
{
  "summary": "string",
  "suggestions": ["string"],
  "risks": ["string"]
}

Monthly income: ${monthlyIncome}
Transactions: ${JSON.stringify(simplifiedTransactions)}
`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a precise financial analyst. Return ONLY valid JSON."
          },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3
      });

      const raw = chatCompletion.choices[0]?.message?.content || "";
      const parsed = extractJson(raw);

      return res.status(200).json({
        message: "AI suggestions generated",
        payload: {
          source: "ai",
          summary: parsed.summary || heuristic.summary,
          suggestions: parsed.suggestions || heuristic.suggestions,
          risks: parsed.risks || heuristic.risks
        }
      });
    } catch (aiError) {
      console.log("AI suggestions fallback:", aiError.message);
      return res.status(200).json({
        message: "Fallback suggestions generated",
        payload: { ...heuristic, source: "heuristic" }
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Failed to generate suggestions",
      error: err.message
    });
  }
});

aiRouter.post("/chat-bot", checkUser, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!isFinanceProjectQuestion(message)) {
      return res.status(200).json({
        message: "Chatbot response generated",
        payload: {
          source: "guardrail",
          reply:
            "I can only help with this expense tracker project: transactions, income, bills, EMIs, budgets, reports, analytics, profile, and notifications."
        }
      });
    }

    const data = await getUserFinanceData(req.user._id);
    const monthlyIncome = req.user.monthlyIncome || 0;
    const expenseRatio =
      monthlyIncome > 0 ? Math.round((data.totalExpenses / monthlyIncome) * 100) : 0;
    const emiRatio =
      monthlyIncome > 0 ? Math.round((data.totalMonthlyEMI / monthlyIncome) * 100) : 0;
    const overallUsage =
      monthlyIncome > 0
        ? Math.round(
            ((data.totalExpenses + data.totalMonthlyEMI + data.monthlyBillBurden) /
              monthlyIncome) *
              100
          )
        : 0;
    const netSavings =
      monthlyIncome -
      data.totalExpenses -
      Math.round(data.totalMonthlyEMI) -
      data.monthlyBillBurden;

    const fallbackReply = buildChatbotFallback({
      message,
      monthlyIncome,
      netSavings,
      ...data
    });

    if (!groq) {
      return res.status(200).json({
        message: "Chatbot fallback response generated",
        payload: { reply: fallbackReply, source: "fallback" }
      });
    }

    const systemPrompt = `
You are a personal finance assistant for this user.
Use PRE-CALCULATED SUMMARY for totals. Do not recalculate them.
Always use Rs. for amounts.
If asked about bills, bill reminders, due dates, utilities, rent, subscriptions, or recurring payments, answer from BILL REMINDER DETAILS first. Do not confuse bills with EMI records.

USER PROFILE:
- Username: ${req.user.username}
- Monthly Income: ${formatMoney(monthlyIncome)}

PRE-CALCULATED SUMMARY:
- Total Expenses: ${formatMoney(data.totalExpenses)}
- Income from transactions: ${formatMoney(data.totalIncome)}
- Net Savings after expenses, EMIs, and monthly bills: ${formatMoney(netSavings)}
- Monthly EMI burden: ${formatMoney(data.totalMonthlyEMI)}
- Monthly bill reminder burden: ${formatMoney(data.monthlyBillBurden)}
- Total active bill reminder amount: ${formatMoney(data.totalBillAmount)}
- Expense to income ratio: ${expenseRatio}%
- EMI to income ratio: ${emiRatio}%
- Overall budget usage: ${overallUsage}%
- Category wise spending: ${JSON.stringify(data.categoryTotals)}
- Top spending category: ${data.topCategory?.[0] || "N/A"} (${formatMoney(data.topCategory?.[1] || 0)})

TRANSACTIONS:
${JSON.stringify(
  data.transactions.slice(0, 20).map((item) => ({
    amount: item.amount,
    category: item.category,
    type: item.type,
    merchant: item.merchant || "N/A",
    date: new Date(item.date).toLocaleDateString("en-IN")
  }))
)}

EMI DETAILS:
- Total EMIs: ${data.emiList.length}
- Paid EMIs: ${data.emiList.filter((emi) => emi.paid).length}
- Unpaid EMIs: ${data.emiList.filter((emi) => !emi.paid).length}
- EMI list: ${JSON.stringify(
  data.emiList.map((emi) => ({
    loanAmount: emi.loanAmount,
    interestRate: emi.interestRate,
    tenureMonths: emi.tenureMonths,
    monthlyEMI: Math.round(calculateEMI(emi.loanAmount, emi.interestRate, emi.tenureMonths)),
    dueDate: new Date(emi.dueDate).toLocaleDateString("en-IN"),
    paid: emi.paid
  }))
)}

BILL REMINDER DETAILS:
- Total bill reminders: ${data.billList.length}
- Paid bill reminders: ${data.billList.filter((bill) => bill.paid).length}
- Unpaid bill reminders: ${data.unpaidBills.length}
- Overdue bill reminders: ${data.overdueBills.length}
- Monthly bill burden: ${formatMoney(data.monthlyBillBurden)}
- Bill reminder list: ${JSON.stringify(
  data.billList.map((bill) => ({
    title: bill.title,
    category: bill.category,
    amount: bill.amount,
    frequency: bill.frequency,
    dueDate: new Date(bill.dueDate).toLocaleDateString("en-IN"),
    paid: bill.paid,
    lastPaymentDate: bill.paymentDate
      ? new Date(bill.paymentDate).toLocaleDateString("en-IN")
      : null
  }))
)}
`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5
      });

      const reply = chatCompletion.choices[0]?.message?.content || fallbackReply;

      return res.status(200).json({
        message: "Chatbot response generated",
        payload: { reply, source: reply === fallbackReply ? "fallback" : "ai" }
      });
    } catch (aiError) {
      console.log("Chatbot fallback:", aiError.message);
      return res.status(200).json({
        message: "Chatbot fallback response generated",
        payload: { reply: fallbackReply, source: "fallback" }
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Chatbot failed",
      error: err.message
    });
  }
});
