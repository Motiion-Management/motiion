import type { NotificationItemProps } from '~/components/notifications/NotificationItem';

// Placeholder images - using existing home images
const mediaCover = require('~/assets/images/home/media-cover.png');
const databaseCover = require('~/assets/images/home/database-cover.png');

export type NotificationType = 'general' | 'request';

export interface NotificationData extends Omit<NotificationItemProps, 'onPress'> {
  type: NotificationType;
}

export const notificationsData: NotificationData[] = [
  {
    id: '1',
    name: 'JaQuel Knight',
    message: 'Confirm your class spot',
    timeAgo: '30m ago',
    avatarUrl: mediaCover,
    isRead: false,
    type: 'general',
  },
  {
    id: '2',
    name: 'Christopher Scott',
    message: "You're confirmed for class",
    timeAgo: '1d ago',
    avatarUrl: databaseCover,
    isRead: true,
    type: 'general',
  },
  {
    id: '3',
    name: 'Mikey Dellavella',
    message: "You're confirmed for session",
    timeAgo: '1w ago',
    avatarUrl: mediaCover,
    isRead: true,
    type: 'general',
  },
  {
    id: '4',
    name: 'JaQuel Knight',
    message: 'Added you as a collaborator',
    timeAgo: '1w ago',
    avatarUrl: mediaCover,
    isRead: false,
    type: 'general',
  },
  {
    id: '5',
    name: 'Nycole Altchiler',
    message: "You're confirmed for class",
    timeAgo: '2w ago',
    avatarUrl: databaseCover,
    isRead: true,
    type: 'general',
  },
  {
    id: '6',
    name: 'Tyrik Patterson',
    message: "You're confirmed for class",
    timeAgo: '3w ago',
    avatarUrl: mediaCover,
    isRead: true,
    type: 'general',
  },
  {
    id: '7',
    name: 'JaQuel Knight',
    message: 'Looking for talent',
    timeAgo: '1mo ago',
    avatarUrl: mediaCover,
    isRead: true,
    type: 'general',
  },
  {
    id: '8',
    name: 'JaQuel Knight',
    message: 'Looking for talent',
    timeAgo: '1mo ago',
    avatarUrl: mediaCover,
    isRead: true,
    type: 'general',
  },
  {
    id: '9',
    name: 'Nycole Altchiler',
    message: 'Teaching this week',
    timeAgo: '1mo ago',
    avatarUrl: databaseCover,
    isRead: true,
    type: 'general',
  },
  // Request notifications (for future use)
  {
    id: 'r1',
    name: 'Maya Taylor',
    message: 'Wants to collaborate',
    timeAgo: '2h ago',
    avatarUrl: mediaCover,
    isRead: false,
    type: 'request',
  },
  {
    id: 'r2',
    name: 'Alex Johnson',
    message: 'Requested to join class',
    timeAgo: '5h ago',
    avatarUrl: databaseCover,
    isRead: false,
    type: 'request',
  },
  {
    id: 'r3',
    name: 'Sarah Chen',
    message: 'Sent you a message',
    timeAgo: '1d ago',
    avatarUrl: mediaCover,
    isRead: true,
    type: 'request',
  },
  {
    id: 'r4',
    name: 'Marcus Williams',
    message: 'Wants to book session',
    timeAgo: '2d ago',
    avatarUrl: databaseCover,
    isRead: true,
    type: 'request',
  },
];

export const getNotificationsByType = (type: NotificationType) => {
  return notificationsData.filter((n) => n.type === type);
};

export const getUnreadCount = (type?: NotificationType) => {
  const notifications = type ? getNotificationsByType(type) : notificationsData;
  return notifications.filter((n) => !n.isRead).length;
};
