export interface GuardrailConfig {
  maxSpendPerDay: string; // in AVAX
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
  allowedEndpoints: string[];
  blockedCountries?: string[];
  requireKYC?: boolean;
  autoBlockSuspicious?: boolean;
}

export class GuardrailService {
  private guardrails = new Map<string, GuardrailConfig>();

  setGuardrails(apiKey: string, config: GuardrailConfig) {
    this.guardrails.set(apiKey, config);
    // In real implementation, this would save to backend
    console.log('Guardrails set for API key:', apiKey, config);
  }

  getGuardrails(apiKey: string): GuardrailConfig | null {
    return this.guardrails.get(apiKey) || null;
  }

  validateRequest(apiKey: string, request: {
    userAddress: string;
    amount: string;
    endpoint: string;
    timestamp: number;
  }): { allowed: boolean; reason?: string } {
    const guardrail = this.guardrails.get(apiKey);
    
    if (!guardrail) {
      return { allowed: true }; // No guardrails set
    }

    // Check endpoint restrictions
    if (!guardrail.allowedEndpoints.includes(request.endpoint)) {
      return { allowed: false, reason: 'Endpoint not allowed' };
    }

    // Check spend limits (mock implementation)
    if (parseFloat(request.amount) > parseFloat(guardrail.maxSpendPerDay) / 10) {
      return { allowed: false, reason: 'Amount exceeds single transaction limit' };
    }

    return { allowed: true };
  }

  // Rate limiting simulation
  async checkRateLimit(apiKey: string, userAddress: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    // Mock implementation - in real app, this would check against Redis/database
    const key = `${apiKey}:${userAddress}:${Math.floor(Date.now() / 60000)}`; // Per minute
    
    // Simulate rate limit check
    const mockCount = Math.floor(Math.random() * 100);
    
    const guardrail = this.guardrails.get(apiKey);
    if (guardrail && mockCount >= guardrail.maxRequestsPerMinute) {
      return { allowed: false, retryAfter: 60 };
    }

    return { allowed: true };
  }

  generateDefaultGuardrails(): GuardrailConfig {
    return {
      maxSpendPerDay: '1.0', // 1 AVAX
      maxRequestsPerMinute: 60,
      maxRequestsPerDay: 1000,
      allowedEndpoints: ['/api/data', '/api/info', '/api/status'],
      autoBlockSuspicious: true
    };
  }
}

export const guardrailService = new GuardrailService();