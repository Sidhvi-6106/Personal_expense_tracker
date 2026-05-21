import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const checkUser = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const token = req?.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    req.user = user;

  next();
  }
  

   catch (err) {
    return res.status(401).json({ message: err.message });
  }
};
