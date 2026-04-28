import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import Payment from "../models/payment.models.js";
import Booking from "../models/booking.models.js";
import paystackService from "../services/payment.service.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Initialize a payment for a booking
 */
export const initializePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: "Booking ID is required" });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId).populate("user");
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verify the booking belongs to the user
        console.log("DEBUG: booking.user._id:", booking.user._id.toString());
        console.log("DEBUG: req.user.id:", req.user.id);
        if (booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to pay for this booking" });
        }

        // Check if booking is already paid
        if (booking.status === "confirmed") {
            return res.status(400).json({ message: "Booking is already confirmed" });
        }

        // Generate unique payment reference
        const reference = `PAY-${uuidv4()}`;

        // Convert amount to kobo (Paystack uses smallest currency unit)
        const amountInKobo = booking.totalPrice * 100;

        // Initialize payment with Paystack
        const paystackResponse = await paystackService.initializePayment({
            email: (booking.user as any).email,
            amount: amountInKobo,
            reference,
            metadata: {
                bookingId: booking._id.toString(),
                userId: req.user.id
            }
        });

        // Create payment record
        const payment = new Payment({
            booking: booking._id,
            user: req.user.id,
            amount: booking.totalPrice,
            paystackReference: reference,
            status: "pending"
        });

        await payment.save();

        res.status(200).json({
            message: "Payment initialized successfully",
            data: {
                authorizationUrl: paystackResponse.data.authorization_url,
                accessCode: paystackResponse.data.access_code,
                reference
            }
        });
    } catch (error) {
        console.error("Initialize Payment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Verify a payment
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { reference } = req.params;

        if (!reference || typeof reference !== "string") {
            return res.status(400).json({ message: "Payment reference is required" });
        }

        // Find payment record
        const payment = await Payment.findOne({ paystackReference: reference }).populate("booking");
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Verify with Paystack
        const paystackResponse = await paystackService.verifyPayment(reference);

        if (paystackResponse.data.status === "success") {
            // Update payment status
            payment.status = "success";
            payment.paymentMethod = paystackResponse.data.channel;
            payment.metadata = paystackResponse.data;
            await payment.save();

            // Update booking status
            const booking = await Booking.findById(payment.booking);
            if (booking) {
                booking.status = "confirmed";
                await booking.save();
            }

            res.json({
                message: "Payment verified successfully",
                payment: {
                    status: payment.status,
                    amount: payment.amount,
                    reference: payment.paystackReference
                }
            });
        } else {
            payment.status = "failed";
            await payment.save();

            res.status(400).json({
                message: "Payment verification failed",
                status: paystackResponse.data.status
            });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Handle Paystack webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers["x-paystack-signature"];

        if (!signature || typeof signature !== "string") {
            return res.status(401).json({ message: "Missing or invalid signature" });
        }

        const payload = JSON.stringify(req.body);

        // Verify webhook signature
        if (!paystackService.verifyWebhookSignature(payload, signature)) {
            return res.status(401).json({ message: "Invalid signature" });
        }

        const event = req.body;

        // Handle different event types
        if (event.event === "charge.success") {
            const reference = event.data.reference;

            // Find and update payment
            const payment = await Payment.findOne({ paystackReference: reference });
            if (payment) {
                payment.status = "success";
                payment.paymentMethod = event.data.channel;
                payment.metadata = event.data;
                await payment.save();

                // Update booking
                const booking = await Booking.findById(payment.booking);
                if (booking) {
                    booking.status = "confirmed";
                    await booking.save();
                }
            }
        }

        res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
