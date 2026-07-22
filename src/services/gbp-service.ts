import { Location } from '@/lib/types';
import { AppStore } from './store';
import { AuditEngine, AuditReport } from './audit-engine';

export class GbpService {
  /**
   * Connects GBP OAuth for a location & syncs live profile data.
   */
  static async connectAndSyncGbp(locationId: string): Promise<{ location: Location; audit: AuditReport }> {
    const locations = AppStore.getLocations();
    const loc = locations.find((l) => l.id === locationId);
    if (!loc) {
      throw new Error(`Location not found: ${locationId}`);
    }

    // Simulate Google Business Profile API sync
    const updatedLocation: Location = {
      ...loc,
      gbpConnected: true,
      gbpStatus: 'VERIFIED',
      category: loc.category || 'Local Business',
      additionalCats: loc.additionalCats?.length ? loc.additionalCats : ['Service Provider'],
      gbpHours: loc.gbpHours || 'Mon-Fri 8:00 AM - 5:00 PM',
      gbpPhotoCount: Math.max(loc.gbpPhotoCount, 14),
      gbpPostCount: Math.max(loc.gbpPostCount, 3),
      gbpLastPostDate: new Date().toISOString(),
    };

    AppStore.saveLocation(updatedLocation);

    // Run unified audit automatically
    const audit = AuditEngine.runUnifiedAudit(updatedLocation);

    return {
      location: updatedLocation,
      audit,
    };
  }

  /**
   * Manual refresh sync for an existing location.
   */
  static async syncProfileData(locationId: string): Promise<{ location: Location; audit: AuditReport }> {
    const locations = AppStore.getLocations();
    const loc = locations.find((l) => l.id === locationId);
    if (!loc) throw new Error(`Location not found: ${locationId}`);

    const audit = AuditEngine.runUnifiedAudit(loc);

    return {
      location: loc,
      audit,
    };
  }
}
