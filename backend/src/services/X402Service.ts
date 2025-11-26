import * as ethers from 'ethers';
import { UsageService } from './UsageService';
import { SubscriptionService } from './SubscriptionService';

export interface PaymentIntent {
  from: string;
  to: string;
  value: string;
  data?: any;
  callbackUrl?: string;
}

export class X402Service {
  private provider: ethers.JsonRpcProvider;
  private usageService: UsageService;
  private subscriptionService: SubscriptionService;

  constructor() {
    console.log('Initializing X402Service...');
    this.provider = new ethers.JsonRpcProvider(
      process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
    );
    this.usageService = new UsageService();
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Check if user can access API (has balance or needs payment)
   */
  async checkAccess(customerWallet: string, planId: string): Promise<{ canAccess: boolean; paymentIntent?: PaymentIntent }> {
    try {
      const plan = await this.subscriptionService.getPlanById(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // For demo: Always require payment to show the flow
      const paymentIntent = await this.createPaymentIntent(
        customerWallet,
        plan.developer_id, // Developer's wallet address
        plan.price_per_call,
        `${process.env.WEBHOOK_BASE_URL}/payment/callback`
      );

      return {
        canAccess: false,
        paymentIntent
      };
    } catch (error) {
      console.error('Error checking access:', error);
      throw error;
    }
  }

  /**
   * Create x402 payment intent
   */
  async createPaymentIntent(
    from: string,
    to: string,
    amount: string,
    callbackUrl: string
  ): Promise<PaymentIntent> {
    console.log('Creating payment intent:', { from, to, amount });
    
    const paymentIntent: PaymentIntent = {
      from,
      to,
      value: ethers.parseEther(amount).toString(),
      data: {
        type: 'x402_payment_intent',
        callbackUrl,
        timestamp: Date.now(),
        intentId: this.generateIntentId()
      }
    };
    
    return paymentIntent;
  }

  /**
   * Verify payment and grant API access
   */
  async verifyAndGrantAccess(transactionHash: string, customerWallet: string, planId: string): Promise<boolean> {
    try {
      const isVerified = await this.verifyPayment(transactionHash);
      
      if (isVerified) {
        const plan = await this.subscriptionService.getPlanById(planId);
        if (!plan) {
          throw new Error('Plan not found');
        }

        const customer = await this.usageService.getOrCreateCustomer(customerWallet);
        
        // Log the usage with payment verification
        await this.usageService.logUsage(
          customer.id,
          planId,
          plan.price_per_call,
          transactionHash,
          'api-call'
        );

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error granting access:', error);
      return false;
    }
  }

  /**
   * Verify a transaction
   */
  async verifyPayment(transactionHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      return receipt?.status === 1;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  /**
   * Generate a unique intent ID
   */
  private generateIntentId(): string {
    return `intent_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}