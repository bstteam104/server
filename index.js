import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRoute.js";
import adminRouter from "./routers/adminRoute.js";

const app = express();

// ✅ Place these first
app.use(express.json()); // Parses JSON requests
app.use(express.urlencoded({ extended: true })); // Parses form data

// Security & other middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());

// MongoDB Connection

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((error) => console.error("❌ Database connection error:", error));

// ✅ Routes must be after middleware
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
