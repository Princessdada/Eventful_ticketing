import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import analyticsService from "../services/analytics.service.js";

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const stats = await analyticsService.getCreatorStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error("Get Analytics Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
