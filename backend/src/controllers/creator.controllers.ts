import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import Event from "../models/event.models.js";
import Booking from "../models/booking.models.js";

/**
 * Get all attendees for a creator's events
 */
export const getMyEventAttendees = async (req: AuthRequest, res: Response) => {
    try {
        // Find all events by this creator
        const events = await Event.find({ creator: req.user.id });
        const eventIds = events.map(e => e._id);

        // Find all bookings for these events
        const bookings = await Booking.find({ event: { $in: eventIds } })
            .populate("user", "name email")
            .populate("event", "title date");

        res.json({
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error("Get My Event Attendees Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
