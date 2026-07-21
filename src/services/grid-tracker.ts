import { GeoGridScan, GridPoint, GridSize, Location } from '@/lib/types';
import { AppStore } from './store';
import { NotificationService } from './notification-service';

export class GridTrackerService {
  /**
   * Generates concentric N x N GPS grid points centered on business location.
   */
  static generateGridCoordinates(
    centerLat: number,
    centerLng: number,
    gridSize: GridSize,
    radiusMiles: number
  ): { lat: number; lng: number }[] {
    const dim = gridSize === '3x3' ? 3 : gridSize === '5x5' ? 5 : 7;
    const half = Math.floor(dim / 2);

    // 1 mile ≈ 0.014492 degrees latitude
    const latStep = (radiusMiles / (half || 1)) * 0.0145;
    const lngStep = (radiusMiles / (half || 1)) * 0.0168;

    const coords: { lat: number; lng: number }[] = [];

    for (let r = -half; r <= half; r++) {
      for (let c = -half; c <= half; c++) {
        coords.push({
          lat: parseFloat((centerLat + r * latStep).toFixed(4)),
          lng: parseFloat((centerLng + c * lngStep).toFixed(4)),
        });
      }
    }

    return coords;
  }

  /**
   * Performs a complete Geo-Grid Rank Scan across all matrix points.
   */
  static async runGeoGridScan(
    location: Location,
    keywordTerm: string,
    gridSize: GridSize = '5x5',
    radiusMiles: number = 2.0
  ): Promise<GeoGridScan> {
    const centerLat = location.lat || 30.2672;
    const centerLng = location.lng || -97.7431;

    const rawCoords = this.generateGridCoordinates(centerLat, centerLng, gridSize, radiusMiles);

    // Simulate rank position at each grid point based on distance from center node
    const points: GridPoint[] = rawCoords.map((coord) => {
      const distFromCenter = Math.sqrt(
        Math.pow(coord.lat - centerLat, 2) + Math.pow(coord.lng - centerLng, 2)
      );

      let position: number;
      if (distFromCenter < 0.005) {
        position = 1; // Center node #1
      } else if (distFromCenter < 0.015) {
        position = Math.floor(Math.random() * 3) + 1; // Top 3
      } else if (distFromCenter < 0.03) {
        position = Math.floor(Math.random() * 5) + 3; // #3 - #7
      } else {
        position = Math.floor(Math.random() * 12) + 7; // #7 - #18
      }

      return {
        lat: coord.lat,
        lng: coord.lng,
        position,
      };
    });

    // Calculate Share of Local Voice (SoLV %: % of nodes ranking #1 - #3)
    const topPackCount = points.filter((p) => (p.position || 99) <= 3).length;
    const shareOfLocalVoice = Math.round((topPackCount / points.length) * 100);

    // Calculate Average Rank
    const totalRank = points.reduce((acc, p) => acc + (p.position || 20), 0);
    const averageRank = parseFloat((totalRank / points.length).toFixed(1));

    // Calculate Volatility Index (Standard deviation of rank positions)
    const variance =
      points.reduce((acc, p) => acc + Math.pow((p.position || 20) - averageRank, 2), 0) / points.length;
    const volatilityScore = parseFloat(Math.min(10, Math.sqrt(variance)).toFixed(1));

    // Calculate Projected 14-day Trend (+/- estimated rank gain)
    const projectedTrend = parseFloat(((50 - shareOfLocalVoice) * -0.05).toFixed(1));

    const scan: GeoGridScan = {
      id: `scan-${Date.now()}`,
      keywordTerm,
      locationId: location.id,
      gridSize,
      radiusMiles,
      centerLat,
      centerLng,
      averageRank,
      shareOfLocalVoice,
      volatilityScore,
      projectedTrend,
      points,
      scannedAt: new Date().toISOString(),
    };

    AppStore.saveGeoScan(scan);

    // Trigger Notification if Share of Local Voice is low (< 50%)
    if (shareOfLocalVoice < 50) {
      NotificationService.triggerAlert(
        'GEO_GRID',
        'Geo-Grid Share of Local Voice Alert',
        `Geo-grid scan for "${keywordTerm}" has only ${shareOfLocalVoice}% Map Pack coverage (#1-#3).`,
        location
      );
    }

    return scan;
  }
}
