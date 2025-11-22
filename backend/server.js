import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import posRoutes from "./routes/posRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
// import wholesalerRoutes from "./routes/wholesalerRoutes.js";
// import dueRoutes from "./routes/dueRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
// import settingsRoutes from "./routes/settingsRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration - allow requests from frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware - use combined format in production, dev in development
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// DB Connection
connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("🧾 Grocery Billing Software Backend is running...");
});


// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/customers", customerRoutes);
// app.use("/api/wholesalers", wholesalerRoutes);
// app.use("/api/due", dueRoutes);
app.use("/api/reports", reportRoutes);
// app.use("/api/settings", settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
  }
});
