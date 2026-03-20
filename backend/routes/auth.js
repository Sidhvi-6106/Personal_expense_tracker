import exp from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { checkUser } from "../middleware/checkUser.js";
import bcrypt from "bcryptjs";

export const authRouter = exp.Router();

const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  number: user.number,
  monthlyIncome: user.monthlyIncome
});

authRouter.post("/auth", async (req, res) => {
  try {
    const { username, email } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken"
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    return res.status(201).json({
      message: "User Created Successfully",
      payload: buildUserResponse(savedUser),
      user: buildUserResponse(savedUser)
    });
  } catch (err) {
    return res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
});

authRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      message: "Login Successful",
      token,
      user: buildUserResponse(user)
    });
  } catch (err) {
    return res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
});

authRouter.get("/auth/profile", checkUser, async (req, res) => {
  try {
    return res.json({
      message: "User profile fetched",
      user: buildUserResponse(req.user)
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching profile"
    });
  }
});

authRouter.put("/auth/profile", checkUser, async (req, res) => {
  try {
    const { username, monthlyIncome, number } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(username && { username }),
          ...(typeof monthlyIncome !== "undefined" && { monthlyIncome }),
          ...(number && { number })
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      user: buildUserResponse(updatedUser)
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

authRouter.put("/auth/change-password", checkUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid User"
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to change password"
    });
  }
});

authRouter.get("/logout", checkUser, async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out" });
  } catch (err) {
    return res.status(400).json({ message: `error in logout ${err.message}` });
  }
});
