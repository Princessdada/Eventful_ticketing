import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import notificationService from "../services/notification.service.js";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const notifications = await notificationService.getNotifications(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error("Get Notifications Controller Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Notification ID is required" });
        }
        const notification = await notificationService.markAsRead(id as string);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(notification);
    } catch (error) {
        console.error("Mark Read Controller Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
