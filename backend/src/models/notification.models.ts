import { Schema, model } from "mongoose";

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["info", "success", "warning", "error"],
        default: "info"
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = model("Notification", NotificationSchema);

export default Notification;
