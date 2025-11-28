import { ethers } from 'ethers';

// Mock x402 Contract ABI (Replace with real ERC-8004 ABI)
const X402_ABI = [
  "function getReputation(address user) external view returns (uint256)",
  "function getPaymentHistory(address user, uint256 limit) external view returns (tuple(bytes32 paymentId, address to, uint256 amount, uint256 timestamp, bool success)[])",
  "function getRiskScore(address user) external view returns (uint8)",
  "function getTotalVolume(address user) external view returns (uint256)",
  "event PaymentIntentCreated(bytes32 indexed paymentId, address indexed from, address indexed to, uint256 amount)",
  "event PaymentExecuted(bytes32 indexed paymentId, address indexed from, address indexed to, uint256 amount)"
];

export class X402ExplorerService {
  private provider: ethers.providers.Web3Provider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
    // Mock contract address - replace with actual x402 contract on Avalanche
    this.contract = new ethers.Contract(
      "0x1234567890123456789012345678901234567890", 
      X402_ABI, 
      this.provider
    );
  }

  async getReputationScore(walletAddress: string): Promise<number> {
    try {
      // Mock implementation - replace with actual contract call
      const mockScores: { [key: string]: number } = {
        '0x1234567890123456789012345678901234567890': 85,
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 72,
        'default': 65
      };
      
      return mockScores[walletAddress.toLowerCase()] || mockScores['default'];
    } catch (error) {
      console.error('Error fetching reputation:', error);
      return 65; // Default score
    }
  }

  async getPaymentHistory(walletAddress: string, limit: number = 10) {
    try {
      // Mock payment history - replace with actual contract calls
      const mockHistory = [
        {
          paymentId: '0x1a2b3c4d5e6f7g8h9i0j',
          to: '0xAPIProvider1abcdef1234567890',
          amount: '0.0015',
          timestamp: Date.now() - 86400000, // 1 day ago
          success: true,
          method: 'x402',
          network: 'Avalanche'
        },
        {
          paymentId: '0x2b3c4d5e6f7g8h9i0j1a',
          to: '0xAPIProvider2abcdef1234567890',
          amount: '0.0025',
          timestamp: Date.now() - 172800000, // 2 days ago
          success: true,
          method: 'x402',
          network: 'Avalanche'
        },
        {
          paymentId: '0x3c4d5e6f7g8h9i0j1a2b',
          to: '0xAPIProvider3abcdef1234567890',
          amount: '0.0008',
          timestamp: Date.now() - 259200000, // 3 days ago
          success: false,
          method: 'x402',
          network: 'Avalanche'
        }
      ];
      
      return mockHistory.slice(0, limit);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  async getRiskIndicators(walletAddress: string) {
    try {
      const reputation = await this.getReputationScore(walletAddress);
      
      return {
        reputationScore: reputation,
        riskLevel: reputation > 80 ? 'Low' : reputation > 60 ? 'Medium' : 'High',
        paymentSuccessRate: '92%',
        averageTransactionValue: '0.0018 AVAX',
        frequency: '2.3 transactions/day',
        flags: reputation < 70 ? ['Recent failed payment'] : []
      };
    } catch (error) {
      console.error('Error fetching risk indicators:', error);
      return null;
    }
  }

  async getAddressAnalytics(walletAddress: string) {
    const [reputation, paymentHistory, riskIndicators] = await Promise.all([
      this.getReputationScore(walletAddress),
      this.getPaymentHistory(walletAddress, 20),
      this.getRiskIndicators(walletAddress)
    ]);

    return {
      walletAddress,
      reputation,
      totalPayments: paymentHistory.length,
      successfulPayments: paymentHistory.filter(p => p.success).length,
      totalVolume: paymentHistory.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      averageAmount: paymentHistory.length > 0 ? 
        paymentHistory.reduce((sum, p) => sum + parseFloat(p.amount), 0) / paymentHistory.length : 0,
      riskIndicators,
      paymentHistory
    };
  }
}

export const x402ExplorerService = new X402ExplorerService();