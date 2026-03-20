import exp from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import EMI from '../models/EMI.js';
import { checkUser } from '../middleware/checkUser.js';

export const analyticsRouter = exp.Router();

analyticsRouter.get('/overall-analysis', checkUser, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const transactionData = await Transaction.aggregate([
            { $match: { userId: userId, isActive: true } },
            {
                $group: {
                    _id: { category: "$category", type: "$type" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const emiData = await EMI.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: "Fixed EMIs",
                    total: { $sum: "$loanAmount" }
                }
            }
        ]);

        const finalData = [...transactionData, ...emiData];

        res.status(200).json({
            message: "User Financial Analysis",
            payload: finalData
        });

    } catch (err) {
        res.status(500).json({
            message: "Error generating analysis",
            error: err.message
        });
    }
});
