import mongoose, { model, Schema } from "mongoose";

const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["expense", "income"],
    default: "expense"
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  merchant: {
    type: String,
    default: ""
  },
  receipt: {
    filename: { type: String, default: "" },
    extractedText: { type: String, default: "" },
    confidence: { type: Number, default: null }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
}, {
  timestamps: true,
  versionKey: false
});

const Transaction = model("Transaction", transactionSchema);

export default Transaction;
