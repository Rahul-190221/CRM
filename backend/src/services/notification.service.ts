import Notification from '../models/Notification';
import { socketService } from './socket.service';

export const createAndEmitNotification = async (
    recipientId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' = 'info',
    link?: string
) => {
    try {
        // 1. Save to MongoDB
        const newNotification = await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            link,
            isRead: false
        });

        // 2. Emit via WebSockets directly to the user
        socketService.emitToUser(recipientId, 'new-notification', newNotification);

        return newNotification;
    } catch (error) {
        console.error('Failed to create and emit notification:', error);
        throw error;
    }
};
