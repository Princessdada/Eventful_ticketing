import { Schema, model } from "mongoose";

const PaymentSchema = new Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "NGN"
    },
    paystackReference: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },
    paymentMethod: {
        type: String
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, { timestamps: true });

const Payment = model("Payment", PaymentSchema);

export default Payment;
