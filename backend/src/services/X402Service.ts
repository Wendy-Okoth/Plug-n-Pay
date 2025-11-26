import { ethers } from 'ethers';

// Simple test to see if ethers is working
console.log('Ethers version:', ethers.version);

export class X402Service {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    console.log('Initializing X402Service...');
    this.provider = new ethers.JsonRpcProvider(
      'https://api.avax-test.network/ext/bc/C/rpc'
    );
  }

  async createPaymentIntent(from: string, to: string, amount: string) {
    console.log('Creating payment intent:', { from, to, amount });
    
    // Simple implementation for testing
    return {
      from,
      to, 
      value: ethers.parseEther(amount).toString(), // Changed in v6
      data: {
        type: 'x402_payment_intent',
        timestamp: Date.now()
      }
    };
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
   * Get transaction details
   */
  async getTransactionDetails(hash: string) {
    try {
      const tx = await this.provider.getTransaction(hash);
      const receipt = await this.provider.getTransactionReceipt(hash);
      
      return {
        hash,
        from: tx?.from,
        to: tx?.to,
        value: ethers.formatEther(tx?.value || 0), // Changed in v6
        status: receipt?.status,
        blockNumber: receipt?.blockNumber
      };
    } catch (error) {
      throw new Error(`Failed to get transaction details: ${error}`);
    }
  }
}