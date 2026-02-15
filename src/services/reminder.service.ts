import EventReminder from "../models/reminder.models.js";
import Event from "../models/event.models.js";

class ReminderService {
    /**
     * Schedule reminders for a user when they book an event
     */
    async scheduleUserReminders(userId: string, eventId: string) {
        try {
            const event = await Event.findById(eventId);
            if (!event || !event.reminders) return;

            const reminders = event.reminders.map(r => ({
                event: eventId,
                user: userId,
                reminderTime: new Date(new Date(event.date).getTime() - (r.offset || 0)),
                type: "creator_set",
                label: r.label
            }));

            if (reminders.length > 0) {
                await EventReminder.insertMany(reminders);
            }
        } catch (error) {
            console.error("Schedule User Reminders Error:", error);
        }
    }

    /**
     * Allow user to set a custom reminder
     */
    async setCustomReminder(userId: string, eventId: string, reminderTime: Date) {
        try {
            const reminder = new EventReminder({
                event: eventId,
                user: userId,
                reminderTime,
                type: "user_set"
            });
            await reminder.save();
            return reminder;
        } catch (error) {
            console.error("Set Custom Reminder Error:", error);
            throw error;
        }
    }
}

export default new ReminderService();
