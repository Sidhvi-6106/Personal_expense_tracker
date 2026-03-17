import exp from "express";
import EMI from "../models/EMI.js";
import { checkUser } from "../middleware/checkUser.js";

export const emiRouter = exp.Router();


// POST EMI
emiRouter.post("/emi", checkUser, async (req, res) => {

  try {

    const newEmi = new EMI({
      ...req.body,
      userId: req.user._id
    });

    const savedEmi = await newEmi.save();

    res.status(201).json({
      message: "EMI added successfully",
      payload: savedEmi
    });

  } catch (err) {

    res.status(400).json({
      message: "Failed to add EMI",
      error: err.message
    });

  }

});


// GET EMI OF USER
emiRouter.get("/emi", checkUser, async (req, res) => {

  try {

    const emiList = await EMI.find({
      userId: req.user._id
    });

    res.status(200).json({
      message: "EMI records retrieved",
      count: emiList.length,
      payload: emiList
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch EMI records"
    });

  }

});