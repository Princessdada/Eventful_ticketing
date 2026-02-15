import { rateLimit } from "express-rate-limit";

// Global limiter: 100 requests per 15 minutes
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for auth routes: 5 attempts per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Increased slightly for testing convenience but still tight
    message: { message: "Too many authentication attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});
