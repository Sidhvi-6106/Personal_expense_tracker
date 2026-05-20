import exp from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { checkUser } from "../middleware/checkUser.js";
import bcrypt from "bcryptjs";

export const authRouter = exp.Router();


// Register
authRouter.post("/auth", async (req, res) => {
  try {
    console.log("auth : ",req.body);
    const { username, email, password } = req.body;

    const HashedPass = await bcrypt.hash(String(password), 10);

    console.log("req body in register:", req.body);

    // check username
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken"
      });
    }

    // check email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // create user
    const newUser = await User.create({
      ...req.body,
      password: HashedPass,
    });

    res.status(201).json({
      message: "User Created Successfully",
      payload: newUser
    });

  } catch (err) {

    console.error("Registration Error:", err);

    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });

  }
});


// Login
authRouter.post("/auth/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    // token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict"
    });

    res.json({
      message: "Login Successful",

      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        number: user.number,
        monthlyIncome: user.monthlyIncome,

        occupation: user.occupation,
        city: user.city,
        currency: user.currency,
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


// Get Profile
authRouter.get("/auth/profile", checkUser, async (req, res) => {

  try {

    res.json({
      message: "User profile fetched",

      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        number: req.user.number,
        monthlyIncome: req.user.monthlyIncome,

        occupation: req.user.occupation,
        city: req.user.city,
        currency: req.user.currency,
      }
    });

  } catch (err) {

    res.status(500).json({
      message: "Error fetching profile"
    });

  }

});


// Update Profile
authRouter.put("/auth/profile", checkUser, async (req, res) => {

  try {

    const {
      username,
      monthlyIncome,
      number,
      occupation,
      city,
      currency,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,

      {
        $set: {
          ...(username && { username }),

          ...(monthlyIncome !== undefined && {
            monthlyIncome
          }),

          ...(number && { number }),

          ...(occupation && { occupation }),

          ...(city && { city }),

          ...(currency && { currency }),
        }
      },

      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      message: "Profile updated successfully",

      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        number: updatedUser.number,
        monthlyIncome: updatedUser.monthlyIncome,

        occupation: updatedUser.occupation,
        city: updatedUser.city,
        currency: updatedUser.currency,
      }
    });

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }

});


// Change Password
authRouter.put("/auth/change-password", checkUser, async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid User"
      });
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Password not matched"
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (err) {

    console.error("Change Password Error:", err);

    res.status(500).json({
      message: "Failed to change password",
      error: err.message
    });

  }

});


// Logout
authRouter.get("/logout", checkUser, async (req, res) => {

  try {

    res.clearCookie("token");

    console.log(req?.body?.user + " logged out ");

    return res.status(200).json({
      message: "User logged out"
    });

  } catch (err) {

    return res.status(400).json({
      message: "error in logout " + err.message
    });

  }

});