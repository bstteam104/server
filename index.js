import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRoute.js";
import adminRouter from "./routers/adminRoute.js";
import { authMiddleware } from './middlewares/authMiddleware.js';
import dotenv from 'dotenv'; // if using ES modules
dotenv.config();

const app = express();

// ✅ Place these first
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security & other middleware
app.use(cors());
app.use(helmet());
app.use(cookieParser());



// mongodb connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((error) => console.error("❌ Database connection error:", error));

// ✅ Routes must be after middleware
app.use("/api/auth", authRouter);
app.use("/api/user", authMiddleware, userRouter);
app.use("/api/admin", authMiddleware, adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
