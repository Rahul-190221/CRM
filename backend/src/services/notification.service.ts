import Notification from '../models/Notification';
import User from '../models/User';
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

export const createAndEmitToAdmins = async (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' = 'info',
    link?: string
) => {
    return createAndEmitToRoles(['admin'], title, message, type, undefined, link);
};

export const createAndEmitToRoles = async (
    roles: string[],
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' = 'info',
    excludeUserId?: string,
    link?: string
) => {
    try {
        const filter: any = { role: { $in: roles }, isActive: true };
        if (excludeUserId) {
            filter._id = { $ne: excludeUserId };
        }
        
        const users = await User.find(filter).select('_id');
        
        await Promise.all(
            users.map(user =>
                createAndEmitNotification(user._id.toString(), title, message, type, link)
            )
        );
    } catch (error) {
        console.error('Failed to create and emit to roles:', error);
    }
};
