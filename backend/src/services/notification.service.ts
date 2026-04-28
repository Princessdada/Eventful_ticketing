import Notification from "../models/notification.models.js";

class NotificationService {
    async notifyUser(userId: string, message: string, type: string = "info") {
        try {
            const notification = new Notification({
                user: userId,
                message,
                type
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error("Notify User Error:", error);
            throw error;
        }
    }

    async getNotifications(userId: string) {
        try {
            return await Notification.find({ user: userId }).sort({ createdAt: -1 });
        } catch (error) {
            console.error("Get Notifications Error:", error);
            throw error;
        }
    }

    async markAsRead(notificationId: string) {
        try {
            return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        } catch (error) {
            console.error("Mark Notification Read Error:", error);
            throw error;
        }
    }
}

export default new NotificationService();
