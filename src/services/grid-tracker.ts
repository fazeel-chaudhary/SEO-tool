import { GeoGridScan, GridPoint, GridSize, Location, CenterMode, DeviceType, NodeCompetitor } from '@/lib/types';
import { AppStore } from './store';
import { NotificationService } from './notification-service';

export class GridTrackerService {
  /**
   * Helper: Map GridSize to dimension count
   */
  static getGridDimension(gridSize: GridSize): number {
    switch (gridSize) {
      case '3x3': return 3;
      case '5x5': return 5;
      case '7x7': return 7;
      case '9x9': return 9;
      case '11x11': return 11;
      case '13x13': return 13;
      case '15x15': return 15;
      default: return 5;
    }
  }

  /**
   * Generates concentric N x N GPS grid points centered on target coordinates.
   * Supports matrices up to 15x15 (225 total scan points).
   */
  static generateGridCoordinates(
    centerLat: number,
    centerLng: number,
    gridSize: GridSize,
    radiusMiles: number
  ): { lat: number; lng: number }[] {
    const dim = this.getGridDimension(gridSize);
    const half = Math.floor(dim / 2);

    // 1 mile ≈ 0.0145 degrees latitude, 0.0168 degrees longitude
    const latStep = half > 0 ? (radiusMiles / half) * 0.0145 : 0.0145;
    const lngStep = half > 0 ? (radiusMiles / half) * 0.0168 : 0.0168;

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
   * Performs a complete Geo-Grid Rank Scan across all matrix points (up to 225 nodes).
   */
  static async runGeoGridScan(
    location: Location,
    keywordTerm: string,
    gridSize: GridSize = '5x5',
    radiusMiles: number = 2.0,
    centerMode: CenterMode = 'BUSINESS_LOCATION',
    deviceType: DeviceType = 'MOBILE',
    customLat?: number,
    customLng?: number
  ): Promise<GeoGridScan> {
    let centerLat = location.lat || 30.2672;
    let centerLng = location.lng || -97.7431;

    if (centerMode === 'CITY_CENTER') {
      centerLat = (location.lat || 30.2672) + 0.005;
      centerLng = (location.lng || -97.7431) - 0.005;
    } else if (centerMode === 'CUSTOM_COORDS' && customLat !== undefined && customLng !== undefined) {
      centerLat = customLat;
      centerLng = customLng;
    }

    const rawCoords = this.generateGridCoordinates(centerLat, centerLng, gridSize, radiusMiles);

    const mockCompetitorPool: Omit<NodeCompetitor, 'rank'>[] = [
      { name: `${location.city} Premier ${location.category}`, category: location.category, rating: 4.9, reviews: 185, photos: 48, distance: '0.3 mi' },
      { name: `Capital City ${location.category} Hub`, category: location.category, rating: 4.8, reviews: 142, photos: 35, distance: '0.6 mi' },
      { name: `Downtown ${location.category} Specialists`, category: `${location.category} Specialist`, rating: 4.7, reviews: 96, photos: 28, distance: '0.9 mi' },
      { name: `Metro ${location.category} Center`, category: location.category, rating: 4.6, reviews: 78, photos: 22, distance: '1.2 mi' },
      { name: `${location.city} Express ${location.category}`, category: `Express ${location.category}`, rating: 4.5, reviews: 62, photos: 19, distance: '1.5 mi' },
    ];

    // Attempt live API rank check via /api/v1/rank-check
    let liveRankData: any = null;
    try {
      const res = await fetch('/api/v1/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: keywordTerm, city: location.city }),
      });
      if (res.ok) {
        liveRankData = await res.json();
      }
    } catch (e) {
      console.warn('Live API rank fetch fallback to local matrix generation:', e);
    }

    // Simulate rank position and SERP competitor snapshot at each grid point
    const points: GridPoint[] = rawCoords.map((coord, idx) => {
      const distFromCenter = Math.sqrt(
        Math.pow(coord.lat - centerLat, 2) + Math.pow(coord.lng - centerLng, 2)
      );

      let position: number;
      if (liveRankData && liveRankData.position) {
        position = idx === Math.floor(rawCoords.length / 2) ? liveRankData.position : Math.min(20, liveRankData.position + Math.floor(distFromCenter * 150));
      } else if (distFromCenter < 0.006) {
        position = 1; // Center node #1
      } else if (distFromCenter < 0.018) {
        position = Math.floor(Math.random() * 3) + 1; // Top 3
      } else if (distFromCenter < 0.035) {
        position = Math.floor(Math.random() * 7) + 4; // #4 - #10
      } else if (distFromCenter < 0.06) {
        position = Math.floor(Math.random() * 10) + 11; // #11 - #20
      } else {
        position = Math.floor(Math.random() * 30) + 21; // #21 - #50+
      }

      const organicPosition = Math.min(100, position + Math.floor(Math.random() * 5));

      // Build SERP competitor snapshot at this node
      const competitorsAtNode: NodeCompetitor[] = mockCompetitorPool.map((comp, cIdx) => ({
        ...comp,
        rank: cIdx < position ? cIdx + 1 : cIdx + 2,
      }));

      const isCenterNode = Math.floor(rawCoords.length / 2) === idx;

      return {
        lat: coord.lat,
        lng: coord.lng,
        position,
        organicPosition,
        address: `${location.city} Sector ${idx + 1}`,
        competitors: competitorsAtNode,
        deviceType,
        isCenterNode,
        isDisabled: false,
      };
    });

    // 1. Calculate Share of Local Voice (SoLV %: % of active nodes ranking #1 - #3)
    const top3Count = points.filter((p) => (p.position || 99) <= 3).length;
    const shareOfLocalVoice = Math.round((top3Count / points.length) * 100);

    // 2. Calculate Overall Visibility Score (0 - 100 weighted index)
    const visibilityScore = Math.round(
      points.reduce((acc, p) => {
        const pos = p.position || 50;
        if (pos <= 3) return acc + 100;
        if (pos <= 10) return acc + 60;
        if (pos <= 20) return acc + 30;
        return acc + 10;
      }, 0) / points.length
    );

    // 3. Calculate Average Rank, Highest Rank, Lowest Rank
    const ranks = points.map((p) => p.position || 50);
    const averageRank = parseFloat((ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1));
    const highestRank = Math.min(...ranks);
    const lowestRank = Math.max(...ranks);

    // 4. Volatility Index & Projected Trend
    const variance = ranks.reduce((acc, r) => acc + Math.pow(r - averageRank, 2), 0) / ranks.length;
    const volatilityScore = parseFloat(Math.min(10, Math.sqrt(variance)).toFixed(1));
    const projectedTrend = parseFloat(((60 - shareOfLocalVoice) * -0.05).toFixed(1));

    const scan: GeoGridScan = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      keywordTerm,
      locationId: location.id,
      gridSize,
      radiusMiles,
      centerLat,
      centerLng,
      centerMode,
      deviceType,
      searchEngine: 'Google Maps / Local Pack',
      averageRank,
      highestRank,
      lowestRank,
      visibilityScore,
      shareOfLocalVoice,
      volatilityScore,
      projectedTrend,
      bestArea: `Downtown ${location.city} (Avg #${highestRank})`,
      weakArea: `Outer Suburbs ${location.city} (Avg #${lowestRank})`,
      points,
      scannedAt: new Date().toISOString(),
    };

    AppStore.saveGeoScan(scan);

    if (shareOfLocalVoice < 50) {
      NotificationService.triggerAlert(
        'GEO_GRID',
        'Geo-Grid Local Pack Coverage Alert',
        `Geo-grid scan for "${keywordTerm}" has only ${shareOfLocalVoice}% Map Pack coverage (#1-#3).`,
        location
      );
    }

    return scan;
  }

  /**
   * Compares two historical scans point-by-point to generate rank improvement/drop deltas.
   */
  static compareGeoScans(scanOld: GeoGridScan, scanNew: GeoGridScan) {
    const pointDeltas = scanNew.points.map((ptNew, idx) => {
      const ptOld = scanOld.points[idx];
      const rankOld = ptOld ? (ptOld.position || 50) : 50;
      const rankNew = ptNew.position || 50;
      const change = rankOld - rankNew; // Positive = gain, Negative = drop

      return {
        lat: ptNew.lat,
        lng: ptNew.lng,
        rankOld,
        rankNew,
        change,
      };
    });

    const totalGains = pointDeltas.filter((d) => d.change > 0).length;
    const totalDrops = pointDeltas.filter((d) => d.change < 0).length;
    const totalUnchanged = pointDeltas.filter((d) => d.change === 0).length;
    const avgChange = parseFloat((scanOld.averageRank - scanNew.averageRank).toFixed(1));

    return {
      scanOld,
      scanNew,
      pointDeltas,
      totalGains,
      totalDrops,
      totalUnchanged,
      avgChange,
    };
  }
}
