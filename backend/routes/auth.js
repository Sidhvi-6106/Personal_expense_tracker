import exp from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { checkUser } from "../middleware/checkUser.js";
import bcrypt from "bcryptjs";

export const authRouter = exp.Router();


//register
authRouter.post("/auth", async (req, res) => {
  try {

    const { username, email } = req.body;

    // check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken"
      });
    }

    // check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User Created Successfully",
      payload: userResponse
    });

  } catch (err) {

    console.error("Registration Error:", err);

    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });

  }
});


//login
authRouter.post("/auth/login", async (req, res) => {

  try {
    console.log("req obj in login : ",req.body)

    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email"
      });
    }

    // compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    // generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, { httpOnly: true,sameSite:"lax",secure:"false" });


    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        monthlyIncome: user.monthlyIncome
      }
    });

  } catch (err) {

    console.error("Login Error:", err);

    res.status(500).json({
      message: "Login failed",
      error: err.message
    });

  }

});


authRouter.get("/auth/profile", checkUser, async (req, res) => {

  try {

    res.json({
      message: "User profile fetched",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        monthlyIncome: req.user.monthlyIncome
      }
    });

  } catch (err) {

    res.status(500).json({
      message: "Error fetching profile"
    });

  }

});

//edit profile details
authRouter.put("/auth/profile", checkUser, async (req, res) => {
  try {

    const { username, monthlyIncome, number } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(username && { username }),
          ...(monthlyIncome && { monthlyIncome }),
          ...(number && { number })
        }
      },
      {
        new: true,
        runValidators: true   // ⭐ THIS IS THE FIX
      }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        number: updatedUser.number,
        monthlyIncome: updatedUser.monthlyIncome
      }
    });

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }
});

//change password
authRouter.put("/auth/change-password", checkUser, async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid User"
      });
    }

    // check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to change password"
    });

  }

});

//logout
authRouter.get('/logout', checkUser, async(req,res)=>{
  try{
    res.clearCookie("token");
    console.log(req?.body?.user+" logged out ")

    return res.status(200).json({ message: "User logged out" });

  } catch (err) {
    return res.status(400).json({message:"error in logout "+err.message})

  }
})