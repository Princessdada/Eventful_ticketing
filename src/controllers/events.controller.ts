
import type { Request, Response } from "express";
import Event from "../models/event.models.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import cacheService from "../services/cache.service.js";

// Create a new event
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        console.log("DEBUG: Create Event Request:", {
            bodyKeys: Object.keys(req.body),
            title: req.body.title,
            hasImage: !!req.body.image
        });
        const { title, description, date, location, price, image } = req.body;

        console.log("DEBUG: Validation Check Proceeding...");
        // Basic validation - check for missing or empty strings
        if (!title || !description || !date || !location || (price === undefined || price === null || price === "")) {
            console.log("DEBUG: Validation Failed:", { title, description, date, location, price });
            return res.status(400).json({ message: "All fields are required. Please ensure price is a valid number." });
        }

        console.log("DEBUG: Creating Event Instance...");
        const event = new Event({
            title,
            description,
            date,
            location,
            price,
            image,
            creator: req.user.id, // Assumes auth middleware populates req.user
            attendees: []
        });

        console.log("DEBUG: Saving Event to DB...");
        await event.save();
        console.log("DEBUG: Event saved successfully:", event._id);
        cacheService.del("all_events");
        res.status(201).json(event);
    } catch (error: any) {
        console.error("Create Event Error:", error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Error", 
                errors: Object.values(error.errors).map((e: any) => e.message) 
            });
        }
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
        const { id } = req.params;
        
        // Validate hex ID format for MongoDB to prevent CastError 500
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log(`DEBUG: Invalid ID format requested: ${id}`);
            return res.status(404).json({ message: "Event not found (Invalid ID format)" });
        }

        const cacheKey = `event_${id}`;
        const cachedEvent = cacheService.get(cacheKey);
        if (cachedEvent) {
            console.log(`DEBUG: Serving ${cacheKey} from cache`);
            return res.json(cachedEvent);
        }

        const event = await Event.findById(id).populate("creator", "name email");
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const eventWithShareUrl = {
            ...event.toObject(),
            shareUrl: `${process.env.APP_URL || 'http://localhost:8000'}/api/events/${event._id}`
        };
        cacheService.set(cacheKey, eventWithShareUrl);
        res.json(eventWithShareUrl);
    } catch (error: any) {
        console.error("Get Event Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
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
