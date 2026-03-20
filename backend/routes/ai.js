import exp from "express";
import Transaction from "../models/Transaction.js";
import { checkUser } from "../middleware/checkUser.js";

export const aiRouter = exp.Router();

const buildHeuristicSuggestions = ({ monthlyIncome, transactions }) => {
  const expenses = transactions.filter((item) => item.type !== "income");
  const income = transactions.filter((item) => item.type === "income");
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0) || monthlyIncome || 0;
  const byCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => ({
      category,
      amount,
      share: totalExpense ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0
    }));

  const suggestions = [];

  if (!transactions.length) {
    suggestions.push("Start by adding your first week of transactions so the app can identify spending patterns.");
  }

  if (totalIncome && totalExpense > totalIncome * 0.8) {
    suggestions.push("Your spending is close to your income. Set category caps for the rest of this month.");
  }

  if (topCategories[0]?.share >= 35) {
    suggestions.push(`Most of your spending is in ${topCategories[0].category}. Review that category first for savings.`);
  }

  if (expenses.filter((item) => item.category.toLowerCase() === "food").length >= 4) {
    suggestions.push("Food spending appears frequently. A weekly meal budget could make your cash flow steadier.");
  }

  if (!suggestions.length) {
    suggestions.push("Your spending pattern looks balanced. Keep tracking and review the top categories once a week.");
  }

  return {
    source: "heuristic",
    snapshot: {
      monthlyIncome: totalIncome,
      totalExpense,
      remaining: totalIncome - totalExpense,
      topCategories
    },
    suggestions
  };
};

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Model did not return valid JSON");
  }
  return JSON.parse(match[0]);
};

const callOpenAI = async ({ prompt, imageData }) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: imageData
            ? [
                { type: "input_text", text: prompt },
                { type: "input_image", image_url: imageData }
              ]
            : [{ type: "input_text", text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "OpenAI request failed");
  }

  const data = await response.json();
  return data.output_text || "";
};

aiRouter.get("/suggestions", checkUser, async (req, res) => {
  const transactions = await Transaction.find({
    userId: req.user._id,
    isActive: true
  }).sort({ date: -1 });

  const baseInsights = buildHeuristicSuggestions({
    monthlyIncome: req.user.monthlyIncome,
    transactions
  });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({
      message: "AI suggestions generated",
      payload: baseInsights
    });
  }

  try {
    const prompt = `
Return only JSON with keys: summary, suggestions, risks.
You are a financial wellness coach for an Indian personal expense tracker user.
Monthly income: ${req.user.monthlyIncome || 0}
Transactions: ${JSON.stringify(transactions.slice(0, 30))}
Keep all advice concise, practical, and non-judgmental.
`;

    const output = await callOpenAI({ prompt });
    const parsed = extractJson(output);

    return res.status(200).json({
      message: "AI suggestions generated",
      payload: {
        ...baseInsights,
        source: "openai",
        summary: parsed.summary || "",
        suggestions: parsed.suggestions?.length ? parsed.suggestions : baseInsights.suggestions,
        risks: parsed.risks || []
      }
    });
  } catch (err) {
    return res.status(200).json({
      message: "AI fallback suggestions generated",
      payload: baseInsights,
      error: err.message
    });
  }
});

aiRouter.post("/scan-receipt", checkUser, async (req, res) => {
  try {
    const { imageData, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: "Receipt image is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        message: "Receipt scanning requires OPENAI_API_KEY configuration"
      });
    }

    const prompt = `
Extract the receipt details and return only JSON with keys:
merchant, amount, date, category, description, type, extractedText, confidence.
Use category values like Food, Shopping, Travel, Utilities, Health, Entertainment, Electronics, Rent, Other.
Use type as expense unless the receipt clearly shows income.
Date must be YYYY-MM-DD when available.
Amount must be a number.
`;

    const output = await callOpenAI({ prompt, imageData });
    const parsed = extractJson(output);

    return res.status(200).json({
      message: "Receipt scanned successfully",
      payload: {
        filename: filename || "",
        merchant: parsed.merchant || "",
        amount: Number(parsed.amount) || 0,
        date: parsed.date || new Date().toISOString().split("T")[0],
        category: parsed.category || "Other",
        description: parsed.description || "",
        type: parsed.type === "income" ? "income" : "expense",
        receipt: {
          filename: filename || "",
          extractedText: parsed.extractedText || "",
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : null
        }
      }
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Failed to scan receipt"
    });
  }
});
