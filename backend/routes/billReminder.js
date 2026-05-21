import exp from "express";
import BillReminder from "../models/BillReminder.js";
import { checkUser } from "../middleware/checkUser.js";

export const billReminderRouter = exp.Router();

const sanitizeBillPayload = (body = {}) => ({
  title: body.title,
  category: body.category,
  amount: Number(body.amount),
  dueDate: body.dueDate,
  frequency: body.frequency
});

const getNextDueDate = (dueDate, frequency = "Monthly") => {
  const nextDueDate = new Date(dueDate);

  if (frequency === "Quarterly") {
    nextDueDate.setMonth(nextDueDate.getMonth() + 3);
  } else if (frequency === "Yearly") {
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
  } else {
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }

  return nextDueDate;
};


// ADD BILL
billReminderRouter.post(
  "/bill-reminder",
  checkUser,
  async (req, res) => {
    try {
      if (!Number(req.body.amount) || Number(req.body.amount) <= 0) {
        return res.status(400).json({
          message: "Amount must be positive"
        });
      }

      const bill = new BillReminder({
        ...sanitizeBillPayload(req.body),
        userId: req.user._id
      });

      const savedBill = await bill.save();

      return res.status(201).json({
        message: "Bill reminder added",
        payload: savedBill
      });

    } catch (err) {
      return res.status(400).json({
        message: err.message
      });
    }
  }
);


// GET BILLS
billReminderRouter.get(
  "/bill-reminder",
  checkUser,
  async (req, res) => {
    try {

      const bills = await BillReminder.find({
        userId: req.user._id,
        isActive: true
      }).sort({ dueDate: 1 });

      return res.status(200).json({
        payload: bills
      });

    } catch (err) {

      return res.status(500).json({
        message: "Failed to fetch bills"
      });
    }
  }
);


// UPDATE BILL
billReminderRouter.put(
  "/bill-reminder/:id",
  checkUser,
  async (req, res) => {
    try {
      if (!Number(req.body.amount) || Number(req.body.amount) <= 0) {
        return res.status(400).json({
          message: "Amount must be positive"
        });
      }

      const bill = await BillReminder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true
      });

      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const updatedBill = await BillReminder.findByIdAndUpdate(
        req.params.id,
        sanitizeBillPayload(req.body),
        { new: true, runValidators: true }
      );

      if (!updatedBill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      return res.status(200).json({
        payload: updatedBill
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message
      });
    }
  }
);


// DELETE/RESTORE
billReminderRouter.patch(
  "/bill-reminder/:id",
  checkUser,
  async (req, res) => {

    try {
      const bill = await BillReminder.findOne({
        _id: req.params.id,
        userId: req.user._id
      });

      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const updatedBill =
        await BillReminder.findByIdAndUpdate(
          req.params.id,
          {
            isActive:
              req.body.isActive === true
          },
          { new: true }
        );

      return res.status(200).json({
        payload: updatedBill
      });

    } catch (err) {

      return res.status(400).json({
        message: err.message
      });
    }
  }
);


// PAID / UNPAID
billReminderRouter.patch(
  "/bill-reminder/pay/:id",
  checkUser,
  async (req, res) => {

    try {
      const bill = await BillReminder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isActive: true
      });

      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const { paid } = req.body;
      const nextDueDate = paid
        ? getNextDueDate(bill.dueDate, bill.frequency)
        : bill.dueDate;

      const updatedBill =
        await BillReminder.findByIdAndUpdate(
          req.params.id,
          {
            paid: false,
            paymentDate: paid
              ? new Date()
              : null,
            dueDate: nextDueDate
          },
          { new: true }
        );

      return res.status(200).json({
        payload: updatedBill
      });

    } catch (err) {

      return res.status(400).json({
        message: err.message
      });
    }
  }
);
