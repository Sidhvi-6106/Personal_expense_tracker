import exp from "express";
import Transaction from "../models/Transaction.js";
import { checkUser } from "../middleware/checkUser.js";

export const transactionRouter = exp.Router();

const sanitizeTransactionPayload = (body = {}) => ({
  amount: Number(body.amount),
  category: body.category,
  type: body.type === "income" ? "income" : "expense",
  date: body.date,
  description: body.description || "",
  merchant: body.merchant || "",
  receipt: body.receipt || undefined
});

transactionRouter.post("/transactions", checkUser, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...sanitizeTransactionPayload(req.body),
      userId: req.user._id
    });

    const savedTransaction = await newTransaction.save();

    return res.status(201).json({
      message: "Transaction Added",
      payload: savedTransaction
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Failed to add transaction"
    });
  }
});

transactionRouter.get("/transactions", checkUser, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
      isActive: true
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      message: "Transactions Retrieved",
      count: transactions.length,
      payload: transactions
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch transactions"
    });
  }
});

transactionRouter.get("/transactions/:id", checkUser, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }

    return res.status(200).json({
      message: "Transaction Retrieved",
      payload: transaction
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch the transaction"
    });
  }
});

transactionRouter.put("/transactions/:id", checkUser, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      sanitizeTransactionPayload(req.body),
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Transaction updated",
      payload: updatedTransaction
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

transactionRouter.patch("/transactions/:id", checkUser, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    const { isActive } = req.body;

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }

    if (transaction.isActive === isActive) {
      return res.status(400).json({
        message: `Transaction is already ${isActive ? "active" : "deleted"}`
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    return res.status(200).json({
      message: `Transaction ${isActive ? "restored" : "deleted"} successfully`,
      payload: updatedTransaction
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
