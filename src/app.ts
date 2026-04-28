import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import { apiLimiter, authLimiter } from "./middlewares/rateLimit.middleware.js";
import { protect } from "./middlewares/auth.middleware.js";
import connectDB from "./config/db.js";

// Initialize Database
connectDB();

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === "POST") {
    console.log("DEBUG Body Snippet:", JSON.stringify(req.body).slice(0, 500));
  }
  next();
});
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import analyticsRoutes from "./routes/analytics.routes.js";

app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.get("/", (_req: Request, res: Response) => {
  res.send("Eventful API is running 🚀. View docs at /api-docs");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/test-auth", protect, (_req, res) => {
  res.json({ message: "You are authenticated!" });
});

// Redirect legacy or direct /verify links to the frontend
app.get("/verify/:bookingId", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://eventful-ticketing.vercel.app";
  res.redirect(`${frontendUrl}/verify/${req.params.bookingId}`);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Global Error Caught:", err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

export default app;
