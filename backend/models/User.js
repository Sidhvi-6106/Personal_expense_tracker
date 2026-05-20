// User model for the Personal Expense Tracker application
// Importing mongoose to define the schema and model
import { model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
// Define the User schema
const userSchema = new Schema({
  username: {
    type: String,
    required: [true,"Username is required"],
    unique: true
  },
  email: {
    type: String,
    required: [true,"Email is Required"],
    unique:[true, "Duplicate email not allowed"]
  },

  //we need to hash the password before saving it to the database, so we will use bcryptjs for that
  password: {
    type: String,
    required: [true,"Password is Required "],
  },
  number: {
    type: String,
    required: [true, "Phone Number is Required"],
    validate: {
      validator: v => /^[6-9][0-9]{9}$/.test(v),
      message: "Enter a valid 10-digit Indian phone number"
    }
  },
  monthlyIncome: {
    type: Number,
    required: true
  },
  occupation: {
    type: String,
    default: "",
  },

  city: {
    type: String,
    default: "",
  },

  currency: {
    type: String,
    default: "INR",
  },
  
},{
        timestamps:true,
        strict:"throw",
        versionKey:false
    },
);

//exporting model 
const User = model('User', userSchema);
export default User;