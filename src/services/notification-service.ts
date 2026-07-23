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
    
    // Call secure Resend email dispatch route
    fetch('/api/v1/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'alex@apexmarketing.com',
        subject: `[Local SEO OS Alert] ${title}`,
        html: `<h3>Local SEO OS Alert</h3>
               <p><strong>Business Profile:</strong> ${location.name}</p>
               <p><strong>Event:</strong> ${title}</p>
               <p><strong>Detail:</strong> ${message}</p>
               <hr/>
               <p style="font-size:10px;color:#777;">Sent automatically by Local SEO Operating System.</p>`,
      }),
    }).catch((err) => {
      console.warn('Backend email dispatch call failed:', err);
    });

    console.log(`[Email Alert Dispatch] to ${location.organizationId}: ${title}`);

    return notification;
  }
}
