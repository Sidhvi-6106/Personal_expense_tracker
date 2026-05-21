import exp from "express";
import Groq from "groq-sdk";
import EMI from "../models/EMI.js";
import BillReminder from "../models/BillReminder.js";
import Transaction from "../models/Transaction.js";
import { checkUser } from "../middleware/checkUser.js";
import dotenv from "dotenv";

export const aiRouter = exp.Router();
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const allowedCategories = [
  "Food", "Shopping", "Travel", "Utilities", "Health",
  "Entertainment", "Electronics", "Rent", "Salary", "Other", "EMI"
];

const buildHeuristicSuggestions = ({ monthlyIncome, transactions }) => {
  const expenses = transactions.filter((item) => item.type !== "income");
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const categoryTotals = {};

  expenses.forEach((item) => {
    const category = item.category || "Other";
    categoryTotals[category] = (categoryTotals[category] || 0) + Number(item.amount || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
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
      suggestions.push("Set a spending limit for remaining days of the month.");
    }
  }

  if (topCategory) suggestions.push(`${topCategory[0]} is your highest spending category.`);

  const foodExpenses = expenses.filter(
    (item) => item.category && item.category.toLowerCase() === "food"
  );
  if (foodExpenses.length >= 5) {
    suggestions.push("Frequent food spending detected. Try weekly meal planning.");
  }

  if (!suggestions.length) suggestions.push("Your spending pattern currently looks healthy.");

  return {
    summary: totalExpense > monthlyIncome
      ? "Your expenses are exceeding your income."
      : "Your finances look fairly balanced.",
    suggestions,
    risks
  };
};

const extractJson = (text) => {
  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]);
};

const normalizeReceiptPayload = (parsed = {}, filename = "") => {
  const safeAmount = Number(parsed.amount);
  const safeDate =
    parsed.date && !Number.isNaN(new Date(parsed.date).getTime())
      ? new Date(parsed.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
  const safeCategory = allowedCategories.includes(parsed.category) ? parsed.category : "Other";

  if (!safeAmount || safeAmount <= 0) throw new Error("Invalid receipt amount");

  return {
    filename,
    merchant: String(parsed.merchant || "").trim(),
    amount: Number(safeAmount.toFixed(2)),
    date: safeDate,
    category: safeCategory,
    description: String(parsed.description || "").trim(),
    type: parsed.type === "income" ? "income" : "expense",
    receipt: {
      filename,
      extractedText: String(parsed.extractedText || "").trim(),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : null
    }
  };
};

aiRouter.get("/suggestions", checkUser, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      isActive: true
    }).sort({ date: -1 }).limit(30);

    const monthlyIncome = req.user.monthlyIncome || 0;
    const heuristic = buildHeuristicSuggestions({ monthlyIncome, transactions });

    const simplifiedTransactions = transactions.map((item) => ({
      amount: item.amount,
      category: item.category,
      type: item.type,
      merchant: item.merchant,
      date: item.date
    }));

    const prompt = `
You are a smart financial advisor.
Analyze the user's transactions and monthly income.
Return ONLY valid JSON with no markdown or extra explanation.

Format:
{
  "summary": "string",
  "suggestions": ["string"],
  "risks": ["string"]
}

Monthly income: ${monthlyIncome}
Transactions: ${JSON.stringify(simplifiedTransactions)}

Rules:
- Beginner friendly English
- Short suggestions
- Mention overspending if any
- Mention top expense categories
`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a precise financial analyst. Return ONLY valid JSON. No markdown, no explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3
      });

      const raw = chatCompletion.choices[0]?.message?.content || "";
      console.log("🤖 RAW GROQ RESPONSE:", raw);

      const parsed = extractJson(raw);

      const payload = {
        source: "ai",
        summary: parsed.summary || heuristic.summary,
        suggestions: parsed.suggestions || heuristic.suggestions,
        risks: parsed.risks || heuristic.risks
      };

      console.log("✅ SOURCE: ai");
      console.log("📦 RESPONSE:", JSON.stringify(payload, null, 2));

      return res.status(200).json({ message: "AI suggestions generated", payload });

    } catch (aiError) {
      console.log("⚠️ AI ERROR:", aiError.message);

      const payload = {
        source: "heuristic",
        summary: heuristic.summary,
        suggestions: heuristic.suggestions,
        risks: heuristic.risks
      };

      console.log("✅ SOURCE: heuristic");
      console.log("📦 RESPONSE:", JSON.stringify(payload, null, 2));

      return res.status(200).json({ message: "Fallback suggestions generated", payload });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to generate suggestions", error: err.message });
  }
});

aiRouter.post("/scan-receipt", checkUser, async (req, res) => {
  try {
    const { imageData, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: "Receipt image is required" });
    }

    const prompt = `
Extract receipt details from the provided data.
Return ONLY valid JSON with no markdown.

{
  "merchant": "",
  "amount": 0,
  "date": "",
  "category": "",
  "description": "",
  "type": "expense",
  "extractedText": "",
  "confidence": 0.95
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a receipt parser. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.3
    });

    const raw = chatCompletion.choices[0]?.message?.content || "";
    const parsed = extractJson(raw);
    const normalized = normalizeReceiptPayload(parsed, filename || "");

    return res.status(200).json({ message: "Receipt scanned successfully", payload: normalized });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message || "Failed to scan receipt" });
  }
});
aiRouter.post("/chat-bot", checkUser, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const [transactions, emiList, billList] = await Promise.all([
      Transaction.find({
        userId: req.user._id,
        $or: [{ isActive: true }, { isActive: { $exists: false } }]
      }).sort({ date: -1 }),
      EMI.find({
        userId: req.user._id,
        $or: [{ isActive: true }, { isActive: { $exists: false } }]
      }).sort({ dueDate: 1, createdAt: -1 }),
      BillReminder.find({
        userId: req.user._id,
        $or: [{ isActive: true }, { isActive: { $exists: false } }]
      }).sort({ dueDate: 1, createdAt: -1 })
    ]);

    const monthlyIncome = req.user.monthlyIncome || 0;

    // Pre-calculate totals
    const expenseTransactions = transactions.filter(t => t.type !== "income");
    const incomeTransactions = transactions.filter(t => t.type === "income");

    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalMonthlyEMI = emiList.reduce((sum, e) => sum + (e.loanAmount / e.tenureMonths), 0);
    const monthlyBillBurden = billList
      .filter((bill) => bill.frequency === "Monthly")
      .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    const totalBillAmount = billList.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    const unpaidBills = billList.filter((bill) => !bill.paid);
    const overdueBills = unpaidBills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      const today = new Date();

      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return dueDate < today;
    });

    const categoryTotals = {};
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const expenseRatio = monthlyIncome > 0 ? Math.round((totalExpenses / monthlyIncome) * 100) : 0;
    const emiRatio = monthlyIncome > 0 ? Math.round((totalMonthlyEMI / monthlyIncome) * 100) : 0;
    const overallUsage = monthlyIncome > 0 ? Math.round(((totalExpenses + totalMonthlyEMI + monthlyBillBurden) / monthlyIncome) * 100) : 0;
    const netSavings = monthlyIncome - totalExpenses - Math.round(totalMonthlyEMI) - monthlyBillBurden;

    const systemPrompt = `
You are a personal finance assistant for this user.
Use PRE-CALCULATED SUMMARY for all totals — never recalculate from raw transactions.
Answer clearly and concisely in beginner friendly English.
Always use ₹ symbol for amounts.
If the user asks something unrelated to finance, politely say you only handle finance queries.
If the user asks about bills, bill reminders, due dates, utilities, rent, subscriptions, or recurring payments, answer from BILL REMINDER DETAILS first. Do not confuse bill reminders with EMI records.

USER PROFILE:
- Username: ${req.user.username}
- Monthly Income: ₹${monthlyIncome}

PRE-CALCULATED SUMMARY (use these, never recalculate):
- Total Expenses (all time): ₹${totalExpenses}
- Total Income from transactions: ₹${totalIncome}
- Net Savings: ₹${netSavings}
- Monthly EMI burden: ₹${Math.round(totalMonthlyEMI)}
- Expense to income ratio: ${expenseRatio}%
- EMI to income ratio: ${emiRatio}%
- Monthly bill reminder burden: Rs.${monthlyBillBurden}
- Total active bill reminder amount: Rs.${totalBillAmount}
- Unpaid bill reminders: ${unpaidBills.length}
- Overdue bill reminders: ${overdueBills.length}
- Overall budget usage: ${overallUsage}%
- Category wise spending: ${JSON.stringify(categoryTotals)}
- Top spending category: ${topCategory?.[0] || "N/A"} (₹${topCategory?.[1] || 0})

TRANSACTION BREAKDOWN:
- Total transactions: ${transactions.length}
- Expense transactions: ${expenseTransactions.length}
- Income transactions: ${incomeTransactions.length}
- Recent 5 transactions: ${JSON.stringify(
      transactions.slice(0, 5).map(t => ({
        amount: t.amount,
        category: t.category,
        type: t.type,
        merchant: t.merchant || "N/A",
        date: new Date(t.date).toLocaleDateString("en-IN")
      }))
    )}
- All transactions: ${JSON.stringify(
      transactions.map(t => ({
        amount: t.amount,
        category: t.category,
        type: t.type,
        merchant: t.merchant || "N/A",
        date: new Date(t.date).toLocaleDateString("en-IN")
      }))
    )}

EMI DETAILS:
- Total EMIs: ${emiList.length}
- Paid EMIs: ${emiList.filter(e => e.paid).length}
- Unpaid EMIs: ${emiList.filter(e => !e.paid).length}
- Monthly EMI burden: ₹${Math.round(totalMonthlyEMI)}
- EMI list: ${JSON.stringify(
      emiList.map(e => ({
        loanAmount: e.loanAmount,
        interestRate: e.interestRate,
        tenureMonths: e.tenureMonths,
        remainingMonths: e.remainingMonths,
        monthlyEMI: Math.round(e.loanAmount / e.tenureMonths),
        dueDate: new Date(e.dueDate).toLocaleDateString("en-IN"),
        paid: e.paid
      }))
    )}

BILL REMINDER DETAILS:
- Total bill reminders: ${billList.length}
- Paid bill reminders: ${billList.filter((bill) => bill.paid).length}
- Unpaid bill reminders: ${unpaidBills.length}
- Overdue bill reminders: ${overdueBills.length}
- Monthly bill burden: Rs.${monthlyBillBurden}
- Bill reminder list: ${JSON.stringify(
      billList.map((bill) => ({
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

FINANCIAL HEALTH:
- Status: ${overallUsage > 90 ? "🚨 Critical" : overallUsage > 80 ? "⚠️ Caution" : overallUsage > 70 ? "👀 Moderate" : "✅ Healthy"}
- Savings status: ${netSavings < 0 ? "❌ Overspending" : netSavings < 5000 ? "⚠️ Very low savings" : netSavings < 10000 ? "👀 Low savings" : "✅ Good savings"}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I could not generate a response.";

    console.log("💬 CHATBOT QUERY:", message);
    console.log("🤖 CHATBOT REPLY:", reply);

    return res.status(200).json({
      message: "Chatbot response generated",
      payload: { reply }
    });

  } catch (err) {
    console.log("❌ CHATBOT ERROR:", err.message);
    return res.status(500).json({
      message: "Chatbot failed",
      error: err.message
    });
  }
});
