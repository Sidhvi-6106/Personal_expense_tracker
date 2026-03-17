import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const checkUser = async (req, res, next) => {
  try {

    const token = req?.cookies?.token;
    console.log("Token from cookie:", token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    req.user = user;
    console.log("User id :", req.user._id);

  next();
    // if (req.user._id.toString() !== req.params.userid) {
    // return res.status(401).json({
    //   message: "Unauthorized user id not matched"
    // });
  }
  

   catch (err) {
    return res.status(401).json({ message: err.message });
  }
};