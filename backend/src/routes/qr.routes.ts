import { Router } from "express";
import { getBookingQRCode, scanQRCode } from "../controllers/qr.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/qr/{bookingId}:
 *   get:
 *     summary: Get QR code for a booking
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code generated successfully
 */
router.get("/:bookingId", protect, getBookingQRCode);

/**
 * @swagger
 * /api/qr/scan/{bookingId}:
 *   put:
 *     summary: Scan a QR code (Mark attendance)
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket scanned successfully
 */
router.put("/scan/:bookingId", protect, scanQRCode);

export default router;
