import jwt from "jsonwebtoken";
import UserService from "../services/userService.js";

/**
 * Middleware to protect routes
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    // Token format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password)
      const user = await UserService.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      delete user.password;
      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
