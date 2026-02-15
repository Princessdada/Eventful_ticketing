import Event from "../models/event.models.js";
import Booking from "../models/booking.models.js";

class AnalyticsService {
    async getCreatorStats(creatorId: string) {
        try {
            // Find all events by this creator
            const events = await Event.find({ creator: creatorId });
            const eventIds = events.map(event => event._id);

            // Find all confirmed bookings for these events
            const bookings = await Booking.find({
                event: { $in: eventIds },
                status: "confirmed"
            });

            // Calculate stats
            const totalEvents = events.length;
            const totalTicketsSold = bookings.reduce((sum, booking) => sum + (booking.quantity || 0), 0);
            const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
            const totalScanned = bookings.filter(b => b.isScanned).length;

            // Simple breakdown per event
            const eventBreakdown = events.map(event => {
                const eventBookings = bookings.filter(b => b.event.toString() === event._id.toString());
                const ticketsSold = eventBookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
                const revenue = eventBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                const scannedCount = eventBookings.filter(b => b.isScanned).length;

                return {
                    eventId: event._id,
                    title: event.title,
                    ticketsSold,
                    revenue,
                    scannedCount
                };
            });

            return {
                totalEvents,
                totalTicketsSold,
                totalRevenue,
                totalScanned,
                eventBreakdown
            };
        } catch (error) {
            console.error("Analytics Service Error:", error);
            throw error;
        }
    }
}

export default new AnalyticsService();
