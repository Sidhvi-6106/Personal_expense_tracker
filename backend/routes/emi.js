import exp from "express";
import EMI from "../models/EMI.js";
import { checkUser } from "../middleware/checkUser.js";

export const emiRouter = exp.Router();

const sanitizeEmiPayload = (body = {}) => ({
  loanAmount: Number(body.loanAmount),
  interestRate: Number(body.interestRate),
  tenureMonths: Number(body.tenureMonths),
  startDate: body.startDate,
  dueDate: body.dueDate,
  ...(body.merchant !== undefined && { merchant: body.merchant }),
  ...(typeof body.paid === "boolean" && { paid: body.paid }),
  isActive: typeof body.isActive === "boolean" ? body.isActive : true
});

const getNextMonthlyDueDate = (dueDate) => {
  const nextDueDate = new Date(dueDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  return nextDueDate;
};

emiRouter.post("/emi", checkUser, async (req, res) => {
  try {
    const newEmi = new EMI({
      ...sanitizeEmiPayload(req.body),
      userId: req.user._id
    });

    const savedEmi = await newEmi.save();

    return res.status(201).json({
      message: "EMI added successfully",
      payload: savedEmi
    });
  } catch (err) {
    return res.status(400).json({
      message: "Failed to add EMI",
      error: err.message
    });
  }
});

emiRouter.get("/emi", checkUser, async (req, res) => {
  try {
    const emiList = await EMI.find({
      userId: req.user._id,
      isActive: true
    }).sort({ dueDate: 1, createdAt: -1 });

    return res.status(200).json({
      message: "EMI records retrieved",
      count: emiList.length,
      payload: emiList
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch EMI records"
    });
  }
});

// mark emi paid / unpaid
emiRouter.patch("/emi/pay/:id", checkUser, async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);

    if (!emi) {
      return res.status(404).json({
        message: "EMI not found"
      });
    }

    if (emi.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }

    const paid = req.body.paid === true;

    const updatedEmi = await EMI.findByIdAndUpdate(
      req.params.id,
      paid
        ? {
            paid: false,
            paymentDate: new Date(),
            lastReminder: null,
            dueDate: getNextMonthlyDueDate(emi.dueDate)
          }
        : {
            paid: false,
            paymentDate: null,
            lastReminder: new Date()
          },
      { new: true }
    );

    return res.status(200).json({
      message: paid ? "EMI paid and next due date updated" : "EMI marked unpaid",
      payload: updatedEmi
    });

  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

emiRouter.put("/emi/:id", checkUser, async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);

    if (!emi) {
      return res.status(404).json({ message: "EMI not found" });
    }

    if (emi.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const updatedEmi = await EMI.findByIdAndUpdate(
      req.params.id,
      sanitizeEmiPayload(req.body),
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "EMI updated successfully",
      payload: updatedEmi
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Failed to update EMI"
    });
  }
});

emiRouter.patch("/emi/:id", checkUser, async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);

    if (!emi) {
      return res.status(404).json({ message: "EMI not found" });
    }

    if (emi.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const updatedEmi = await EMI.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive === true },
      { new: true }
    );

    return res.status(200).json({
      message: req.body.isActive === true ? "EMI restored" : "EMI deleted",
      payload: updatedEmi
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Failed to update EMI"
    });
  }
});
