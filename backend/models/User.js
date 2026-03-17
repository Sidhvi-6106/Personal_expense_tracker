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
  }
},{
        timestamps:true,
        strict:"throw",
        versionKey:false
    },
);

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return ;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//exporting model 
const User = model('User', userSchema);
export default User;