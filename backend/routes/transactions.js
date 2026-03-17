import exp from 'express'
import Transaction from '../models/Transaction.js'
import { checkUser } from '../middleware/checkUser.js'

export const transactionRouter = exp.Router()

//add transaction
transactionRouter.post('/transactions', checkUser, async (req, res) => {
  try {
    const newTransaction = new Transaction({
      ...req.body,
      userId: req.user._id
    });

    const savedTransaction = await newTransaction.save();

    return res.status(201).json({
      message: "Transaction Added",
      payload: savedTransaction
    });

  } catch (err) {

    res.status(400).json({
      message: "Failed to add transaction"
    });
  }
});


//get user transactions
transactionRouter.get('/transactions', checkUser, async (req, res) => {
  try {

    const transactions = await Transaction.find({
      userId: req.user._id
    });

    return res.status(200).json({
      message: "Transactions Retrieved",
      count: transactions.length,
      payload: transactions
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch transactions"
    });
  }
});

//get transaction id
transactionRouter.get('/transactions/:id', checkUser, async (req, res) => {
  try {

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    //Check ownership
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

    res.status(500).json({
      message: "Failed to fetch the transaction"
    });

  }
});

// update a single transaction by id
transactionRouter.put('/transactions/:id',checkUser,async(req,res)=>{
  try{
    const transaction=await Transaction.findById(req.params.id);
    
    
    if (!transaction){
      return res.json({message:"transaction not found "});
    }
    //Check ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }
    console.log("body : ",req.body);
    const updatedTransaction=await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true })
     if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.status(200).json({message:"transaction updated ",payload:updatedTransaction})
  }catch(err){
    console.log("error ",err.message);
    return res.status(400).json({message :err.message});
  }
})

//delete a transaction
transactionRouter.patch('/transactions/:id',checkUser,async(req,res)=>{
  try{
    const transaction=await Transaction.findById(req.params.id);
    const {isActive} = req.body;
    if (!transaction){
      return res.json({message:"transaction not found "});
    }
    //Check ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }
    if(transaction.isActive===isActive){
       return res.status(400).json({ message: `Transaction is already ${isActive ? "active" : "deleted"}`});
    }

    console.log("body : ",req.body);
    const deletedTransaction=await Transaction.findByIdAndUpdate(req.params.id,{isActive:isActive}, { new: true })
     if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({message: `Transaction ${isActive ? "restored" : "deleted"} successfully`, transaction});

  } catch(err) {
    console.log("error ",err.message);
    return res.status(400).json({message :err.message});
  }
})