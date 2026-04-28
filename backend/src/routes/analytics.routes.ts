import { Router } from "express";
import { getStats } from "../controllers/analytics.controllers.js";
import { getMyEventAttendees } from "../controllers/creator.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get analytics for the logged-in creator
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Creator analytics summary
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, getStats);

/**
 * @swagger
 * /api/analytics/attendees:
 *   get:
 *     summary: Get all attendees for creator's events
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendees across all events
 */
router.get("/attendees", protect, getMyEventAttendees);

export default router;
