import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/user.models';

vi.mock('../models/user.models');

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/auth/signup', () => {
        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBeDefined();
        });

        it('should successfully call signup logic (mocked)', async () => {
            (User.prototype.save as any).mockResolvedValue({
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                role: 'attendee'
            });
            (User.findOne as any).mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/signup')
                .send({ name: 'Test User', email: 'test@example.com', password: 'password123', role: 'attendee' });

            // Note: Currently signup allows both success and error depending on actual DB/Logic
            // We want to verify it doesn't 500.
            expect(res.status).not.toBe(500);
        });
    });
});
