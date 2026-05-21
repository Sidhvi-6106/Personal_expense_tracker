import mongoose, { model, Schema } from "mongoose";

const billReminderSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    dueDate: {
      type: Date,
      required: true
    },

    frequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      default: "Monthly"
    },

    paid: {
      type: Boolean,
      default: false
    },

    paymentDate: {
      type: Date,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false
  }
);

const BillReminder = model(
  "BillReminder",
  billReminderSchema
);

export default BillReminder;