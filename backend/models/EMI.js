//now we import monoose here
import mongoose, {model,Schema} from "mongoose";
// Define the EMI schema
const emiSchema=new Schema({
    loanAmount:{
        type: Number,
        required: true
    },
    interestRate:{
        type: Number,
        required: true
    },
    tenureMonths:{
        type: Number,
        required: true
    },
    startDate:{
        type: Date,
        required: true
    },
    dueDate:{
        type:Date,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps:true,
    versionKey:false
});
const EMI =model('EMI', emiSchema);
export default EMI;
