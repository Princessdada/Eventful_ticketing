import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import Booking from "../models/booking.models.js";
import qrService from "../services/qr.service.js";

/**
 * Get QR code for a booking
 */
export const getBookingQRCode = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({ message: "Booking ID is required" });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId).populate("event");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify the booking belongs to the user or user is a creator
        if (booking.user.toString() !== req.user.id) {
            const event = booking.event as any;
            if (event.creator && event.creator.toString() !== req.user.id) {
                return res.status(403).json({ message: "Not authorized to view this booking" });
            }
        }

        // The data to encode in the QR code (Verification URL)
        const frontendUrl = process.env.FRONTEND_URL || "https://eventful-ticketing.vercel.app";
        const verificationData = `${frontendUrl}/verify/${bookingId}`;

        // Use the service to generate the code
        const qrCodeDataUrl = await qrService.generateQRCode(verificationData);

        res.status(200).json({
            message: "QR code generated successfully",
            qrCode: qrCodeDataUrl
        });
    } catch (error) {
        console.error("Get QR Code Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Scan a QR code (Mark booking as scanned/attended)
 */
export const scanQRCode = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId).populate("event");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Only the event creator can scan
        const event = booking.event as any;
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the event creator can scan QR codes" });
        }

        if (booking.isScanned) {
            return res.status(400).json({ message: "This ticket has already been scanned" });
        }

        (booking as any).isScanned = true;
        await booking.save();

        res.json({ message: "Ticket scanned successfully", booking });
    } catch (error) {
        console.error("Scan QR Code Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
