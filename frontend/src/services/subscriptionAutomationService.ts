export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  pricePerCall: string; // in AVAX
  baseFee: string; // monthly base fee in AVAX
  dailyCap: number;
  monthlyCap: number;
  autoRenew: boolean;
  usageBased: boolean;
  freeTier: number;
  pauseOnLowBalance: boolean;
  cancelAfterFailures: number;
  gracePeriod: number; // in hours
}

export interface AutomationRule {
  id: string;
  type: 'pause' | 'cancel' | 'notify' | 'upgrade' | 'downgrade';
  condition: string;
  action: string;
  enabled: boolean;
}

export class SubscriptionAutomationService {
  private plans = new Map<string, SubscriptionPlan>();
  private automationRules = new Map<string, AutomationRule[]>();

  createPlan(plan: Omit<SubscriptionPlan, 'id'>): SubscriptionPlan {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newPlan = { ...plan, id };
    this.plans.set(id, newPlan);
    return newPlan;
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  getAllPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  // Auto-renewal management
  async processAutoRenewals() {
    // Mock implementation - in real app, this would process actual renewals
    console.log('Processing auto-renewals...');
    
    const renewedSubscriptions = [
      { subscriptionId: 'sub_123', user: '0xuser1...', plan: 'Basic', amount: '0.01 AVAX' },
      { subscriptionId: 'sub_456', user: '0xuser2...', plan: 'Pro', amount: '0.05 AVAX' }
    ];

    return renewedSubscriptions;
  }

  // Usage-based billing calculation
  calculateUsageCost(plan: SubscriptionPlan, usage: number): string {
    if (usage <= plan.freeTier) {
      return plan.baseFee;
    }

    const paidUsage = usage - plan.freeTier;
    const usageCost = parseFloat(plan.pricePerCall) * paidUsage;
    const totalCost = parseFloat(plan.baseFee) + usageCost;
    
    return totalCost.toFixed(6); // Return in AVAX
  }

  // Smart trigger management
  addAutomationRule(planId: string, rule: AutomationRule) {
    if (!this.automationRules.has(planId)) {
      this.automationRules.set(planId, []);
    }
    this.automationRules.get(planId)!.push(rule);
  }

  getAutomationRules(planId: string): AutomationRule[] {
    return this.automationRules.get(planId) || [];
  }

  evaluateTriggers(planId: string, context: {
    userBalance: string;
    paymentFailures: number;
    usage: number;
    lastPayment: number;
  }) {
    const rules = this.getAutomationRules(planId);
    const triggeredRules: AutomationRule[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      let shouldTrigger = false;

      switch (rule.type) {
        case 'pause':
          shouldTrigger = parseFloat(context.userBalance) < 0.001; // Low balance
          break;
        case 'cancel':
          shouldTrigger = context.paymentFailures >= 3;
          break;
        case 'notify':
          shouldTrigger = context.usage > 1000; // High usage
          break;
      }

      if (shouldTrigger) {
        triggeredRules.push(rule);
      }
    }

    return triggeredRules;
  }

  // Generate sample automation rules
  generateSampleRules(): AutomationRule[] {
    return [
      {
        id: 'rule_1',
        type: 'pause',
        condition: 'user_balance < 0.001 AVAX',
        action: 'pause_subscription',
        enabled: true
      },
      {
        id: 'rule_2',
        type: 'cancel',
        condition: 'payment_failures >= 3',
        action: 'cancel_subscription',
        enabled: true
      },
      {
        id: 'rule_3',
        type: 'notify',
        condition: 'usage > 80% of monthly_cap',
        action: 'send_usage_alert',
        enabled: true
      }
    ];
  }
}

export const subscriptionAutomationService = new SubscriptionAutomationService();