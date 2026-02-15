import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { initializePayment, verifyPayment, handleWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

// Initialize payment (requires authentication)
router.post("/initialize", protect, initializePayment);

// Verify payment (requires authentication)
router.get("/verify/:reference", protect, verifyPayment);

// Webhook endpoint (no authentication - verified by signature)
router.post("/webhook", handleWebhook);

export default router;
