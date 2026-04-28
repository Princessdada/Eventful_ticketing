import { Schema, model } from "mongoose";

const BookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending"
    },
    bookingReference: {
        type: String,
        required: true,
        unique: true
    },
    isScanned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Booking = model("Booking", BookingSchema);

export default Booking;
