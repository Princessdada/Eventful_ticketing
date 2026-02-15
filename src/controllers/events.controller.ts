
import type { Request, Response } from "express";
import Event from "../models/event.models.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import cacheService from "../services/cache.service.js";

// Create a new event
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, date, location, price } = req.body;

        // Basic validation
        if (!title || !description || !date || !location || !price) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const event = new Event({
            title,
            description,
            date,
            location,
            price,
            creator: req.user.id, // Assumes auth middleware populates req.user
            attendees: []
        });

        await event.save();
        cacheService.del("all_events");
        res.status(201).json(event);
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all events
export const getEvents = async (req: Request, res: Response) => {
    try {
        const cachedEvents = cacheService.get("all_events");
        if (cachedEvents) {
            console.log("DEBUG: Serving all_events from cache");
            return res.json(cachedEvents);
        }

        const events = await Event.find().populate("creator", "name email");
        cacheService.set("all_events", events);
        res.json(events);
    } catch (error) {
        console.error("Get Events Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get single event by ID
export const getEventById = async (req: Request, res: Response) => {
    try {
        const cacheKey = `event_${req.params.id}`;
        const cachedEvent = cacheService.get(cacheKey);
        if (cachedEvent) {
            console.log(`DEBUG: Serving ${cacheKey} from cache`);
            return res.json(cachedEvent);
        }

        const event = await Event.findById(req.params.id).populate("creator", "name email");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const eventWithShareUrl = {
            ...event.toObject(),
            shareUrl: `${process.env.APP_URL || 'http://localhost:8000'}/api/events/${event._id}`
        };
        cacheService.set(cacheKey, eventWithShareUrl);
        res.json(eventWithShareUrl);
    } catch (error) {
        console.error("Get Event Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update event (Creator only)
export const updateEvent = async (req: AuthRequest, res: Response) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if user is the creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this event" });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return updated document
        );

        cacheService.del(["all_events", `event_${req.params.id}`]);
        res.json(updatedEvent);
    } catch (error) {
        console.error("Update Event Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete event (Creator only)
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if user is the creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this event" });
        }

        await event.deleteOne();
        cacheService.del(["all_events", `event_${req.params.id}`]);
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Delete Event Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
