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
    enum: ["income", "expense"],
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
    type: String
  },
  isActive:{
    type:Boolean,
    default:true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
},
{
  timestamps: true,
  strict: "throw",
  versionKey: false
},
);

const Transaction = model("Transaction", transactionSchema);

export default Transaction;