import express from "express";
import type { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import { apiLimiter, authLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
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

import { protect } from "./middlewares/auth.middleware.js";
app.get("/api/test-auth", protect, (_req, res) => {
  res.json({ message: "You are authenticated!" });
});

export default app;
