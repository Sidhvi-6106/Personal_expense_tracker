import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username must be 30 characters or less"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address"]
  },

  password: {
    type: String,
    required: [true, "Password is required"],
  },
  number: {
    type: String,
    required: [true, "Phone Number is Required"],
    unique: true,
    trim: true,
    validate: {
      validator: v => /^[6-9][0-9]{9}$/.test(v),
      message: "Enter a valid 10-digit Indian phone number"
    }
  },
  monthlyIncome: {
    type: Number,
    required: [true, "Monthly income is required"],
    min: [0, "Monthly income cannot be negative"]
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
