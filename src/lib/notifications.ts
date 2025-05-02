import { prisma } from "@/lib/prisma";

//to create a notification
export async function createNotification({
    userId,
    type,
    message,
    serverId,
  }: {
    userId: string;
    type: string;
    message: string;
    serverId?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        serverId,
      },
    });
    return notification;
  }

  
// Get all notifications for a user
export async function getUserNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return notifications;
  }

  // Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return notification;
  }
  
  // (Optional) Mark all notifications as read
  export async function markAllNotificationsAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }