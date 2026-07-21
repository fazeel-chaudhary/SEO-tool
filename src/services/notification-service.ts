import { NotificationItem, Location } from '@/lib/types';
import { AppStore } from './store';

export class NotificationService {
  /**
   * Triggers an in-app alert & simulates email dispatch for critical local SEO events.
   */
  static triggerAlert(
    type: NotificationItem['type'],
    title: string,
    message: string,
    location: Location
  ): NotificationItem {
    const notification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      read: false,
      locationId: location.id,
      organizationId: location.organizationId,
      createdAt: new Date().toISOString(),
    };

    AppStore.saveNotification(notification);
    console.log(`[Email Alert Dispatch] to ${location.organizationId}: ${title}`);

    return notification;
  }
}
