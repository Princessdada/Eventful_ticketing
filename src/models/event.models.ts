import { Schema, model } from "mongoose";

const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    reminders: [{
        offset: Number, // Offset in milliseconds (e.g. 86400000 for 1 day)
        label: String   // e.g. "1 day before"
    }]
}, { timestamps: true });

const Event = model("Event", EventSchema);

export default Event;