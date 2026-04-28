import { describe, it, expect, vi, beforeEach } from 'vitest';
import analyticsService from '../services/analytics.service';
import Event from '../models/event.models';
import Booking from '../models/booking.models';

vi.mock('../models/event.models.js');
vi.mock('../models/booking.models.js');

describe('AnalyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should calculate stats correctly for a creator', async () => {
        const creatorId = 'creator123';
        const mockEvents = [
            { _id: 'event1', title: 'Event 1' },
            { _id: 'event2', title: 'Event 2' }
        ];
        const mockBookings = [
            { event: 'event1', quantity: 2, totalPrice: 100, status: 'confirmed' },
            { event: 'event1', quantity: 1, totalPrice: 50, status: 'confirmed' },
            { event: 'event2', quantity: 3, totalPrice: 150, status: 'confirmed' }
        ];

        (Event.find as any).mockResolvedValue(mockEvents);
        (Booking.find as any).mockResolvedValue(mockBookings);

        const stats = await analyticsService.getCreatorStats(creatorId);

        expect(stats.totalEvents).toBe(2);
        expect(stats.totalTicketsSold).toBe(6);
        expect(stats.totalRevenue).toBe(300);
        expect(stats.eventBreakdown).toHaveLength(2);
        expect(stats.eventBreakdown[0].ticketsSold).toBe(3);
        expect(stats.eventBreakdown[1].ticketsSold).toBe(3);
    });

    it('should return zeros if no events found', async () => {
        (Event.find as any).mockResolvedValue([]);
        (Booking.find as any).mockResolvedValue([]);

        const stats = await analyticsService.getCreatorStats('user1');

        expect(stats.totalEvents).toBe(0);
        expect(stats.totalTicketsSold).toBe(0);
        expect(stats.totalRevenue).toBe(0);
        expect(stats.eventBreakdown).toHaveLength(0);
    });
});
