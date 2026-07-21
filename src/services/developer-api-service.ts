import { ApiKey, WebhookEndpoint } from '@/lib/types';
import { AppStore } from './store';

export class DeveloperApiService {
  /**
   * Generates a new secure API Key for agency developers.
   */
  static generateApiKey(name: string, orgId: string): ApiKey {
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      name: name || 'Developer API Key',
      key: `lseo_live_sk_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString(),
      organizationId: orgId,
    };

    AppStore.saveApiKey(key);
    return key;
  }
}
