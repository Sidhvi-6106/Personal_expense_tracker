import exp from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { checkUser } from "../middleware/checkUser.js";
import bcrypt from "bcryptjs";

export const authRouter = exp.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^[6-9][0-9]{9}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizeUsername = (username = "") => String(username).trim();
const normalizePhone = (number = "") => String(number).trim();

const getDuplicateMessage = (err) => {
  if (err?.code !== 11000) return null;

  if (err.keyPattern?.username) return "Username already taken";
  if (err.keyPattern?.email) return "Email already registered";
  if (err.keyPattern?.number) return "Phone number already registered";

  return "Account details already exist";
};

const getValidationMessage = (err) => {
  const duplicateMessage = getDuplicateMessage(err);
  if (duplicateMessage) return duplicateMessage;

  const firstError = err?.errors ? Object.values(err.errors)[0] : null;
  return firstError?.message || err.message || "Invalid account details";
};

const validateAccountInput = ({ username, email, password, number, monthlyIncome }, { requirePassword = true } = {}) => {
  const cleanUsername = normalizeUsername(username);
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(number);
  const income = Number(monthlyIncome);

  if (!usernameRegex.test(cleanUsername)) {
    return "Username must be 3-30 characters and can only contain letters, numbers, and underscores";
  }

  if (email !== undefined && !emailRegex.test(cleanEmail)) {
    return "Enter a valid email address";
  }

  if (number !== undefined && !phoneRegex.test(cleanPhone)) {
    return "Enter a valid 10-digit Indian phone number";
  }

  if (monthlyIncome !== undefined && (!Number.isFinite(income) || income < 0)) {
    return "Monthly income cannot be negative";
  }

  if (requirePassword && (!password || String(password).length < 6)) {
    return "Password must be at least 6 characters";
  }

  return null;
};

// Register
authRouter.post("/auth", async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const email = normalizeEmail(req.body.email);
    const number = normalizePhone(req.body.number);
    const { password } = req.body;
    const monthlyIncome = Number(req.body.monthlyIncome);

    const validationError = validateAccountInput({
      username,
      email,
      password,
      number,
      monthlyIncome
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const HashedPass = await bcrypt.hash(String(password), 10);

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

    const existingPhone = await User.findOne({ number });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number already registered"
      });
    }

    // create user
    const newUser = await User.create({
      ...req.body,
      username,
      email,
      number,
      monthlyIncome,
      password: HashedPass,
    });

    res.status(201).json({
      message: "User Created Successfully",
      payload: newUser
    });

  } catch (err) {

    res.status(400).json({
      message: getValidationMessage(err),
      error: err.message
    });

  }
});


// Login
authRouter.post("/auth/login", async (req, res) => {

  try {

    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

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

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction
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
      monthlyIncome,
      occupation,
      city,
      currency,
    } = req.body;
    const username = normalizeUsername(req.body.username);
    const number = normalizePhone(req.body.number);
    const income = Number(monthlyIncome);

    const validationError = validateAccountInput(
      {
        username,
        number,
        monthlyIncome: income
      },
      { requirePassword: false }
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: req.user._id }
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const existingPhone = await User.findOne({
      number,
      _id: { $ne: req.user._id }
    });

    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,

      {
        $set: {
          ...(username && { username }),

          ...(monthlyIncome !== undefined && {
            monthlyIncome: income
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
      message: getValidationMessage(err)
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
