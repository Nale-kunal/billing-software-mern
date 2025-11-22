import UserService from "../services/userService.js";
import { generateToken } from "../config/jwt.js";

/**
 * @desc Register new user (Shop Owner)
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, shopName, phone } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check if user already exists
    const existingUser = await UserService.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await UserService.create({
      name,
      email,
      password,
      shopName,
      phone,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc Login existing user
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find user with password for verification
    const user = await UserService.findOne({ email }, true);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Match password
    const isMatch = await UserService.matchPassword(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Send response
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      shopName: user.shopName,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc Get user profile (Protected)
 * @route GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await UserService.findByIdAndUpdate(req.user._id, {}, { select: "-password", new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Remove password if present
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
