import { Schema, model } from "mongoose";

const EventReminderSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reminderTime: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ["creator_set", "user_set"],
        required: true
    },
    sent: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const EventReminder = model("EventReminder", EventReminderSchema);

export default EventReminder;
