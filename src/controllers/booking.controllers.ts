
import type { Request, Response } from "express";
import Booking from "../models/booking.models.js";
import Event from "../models/event.models.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { v4 as uuidv4 } from 'uuid';
import notificationService from "../services/notification.service.js";
import reminderService from "../services/reminder.service.js";

// Create a new booking
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId, quantity } = req.body;

        if (!eventId || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Event ID and valid quantity are required" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const totalPrice = event.price * quantity;
        const bookingReference = uuidv4();

        const booking = new Booking({
            user: req.user.id,
            event: eventId,
            quantity,
            totalPrice,
            status: "pending", // Default status
            bookingReference
        });

        await booking.save();

        // Notify User
        await notificationService.notifyUser(
            req.user.id,
            `Booking confirmed for ${event.title}`,
            "success"
        );

        // Schedule Reminders
        await reminderService.scheduleUserReminders(req.user.id, eventId);

        res.status(201).json({
            message: "Booking successful",
            booking: {
                ...booking.toObject(),
                qrCodeUrl: `/api/qr/${booking._id}`
            }
        });

    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all bookings for the logged-in user
export const getUserBookings = async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("event", "title date location price")
            .sort({ createdAt: -1 });

        const bookingsWithQr = bookings.map(booking => ({
            ...booking.toObject(),
            qrCodeUrl: `/api/qr/${booking._id}`
        }));

        res.json(bookingsWithQr);
    } catch (error) {
        console.error("Get User Bookings Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get a single booking by ID
export const getBookingById = async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("event", "title date location price");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Ensure the user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this booking" });
        }

        res.json({
            ...booking.toObject(),
            qrCodeUrl: `/api/qr/${booking._id}`
        });
    } catch (error) {
        console.error("Get Booking Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
