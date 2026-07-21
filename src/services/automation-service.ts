import { Location, AutomationRule } from '@/lib/types';
import { AppStore } from './store';
import { AuditEngine } from './audit-engine';
import { NotificationService } from './notification-service';

export class AutomationService {
  /**
   * Executes background automation rule.
   */
  static runAutomation(ruleId: string, location: Location): void {
    const automations = AppStore.getAutomations(location.id);
    const rule = automations.find((a) => a.id === ruleId);
    if (!rule || rule.status === 'PAUSED') return;

    // Run audit update
    AuditEngine.runUnifiedAudit(location);

    // Trigger Notification log
    NotificationService.triggerAlert(
      'AUTOMATION',
      `Executed Workflow: "${rule.name}"`,
      `Background automation run completed for ${location.name}. Recommendations & metrics refreshed.`,
      location
    );
  }
}
