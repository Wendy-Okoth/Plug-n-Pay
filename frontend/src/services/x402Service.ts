import { ethers } from 'ethers';

// Mock x402 Contract ABI (Replace with real ERC-8004 ABI)
const X402_ABI = [
  "function createPaymentIntent(address to, uint256 amount, bytes calldata data) external returns (bytes32)",
  "function executePayment(bytes32 paymentId) external",
  "function getReputation(address user) external view returns (uint256)",
  "function getPaymentHistory(address user) external view returns (tuple(bytes32 paymentId, address to, uint256 amount, uint256 timestamp)[])",
  "function setSpendLimit(uint256 limit) external",
  "event PaymentIntentCreated(bytes32 indexed paymentId, address indexed from, address indexed to, uint256 amount)",
  "event PaymentExecuted(bytes32 indexed paymentId, address indexed from, address indexed to, uint256 amount)"
];

const X402_CONTRACT_ADDRESS = "0x..."; // Your x402 contract address on Avalanche

export class X402Service {
  private provider: ethers.providers.Web3Provider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
    this.contract = new ethers.Contract(X402_CONTRACT_ADDRESS, X402_ABI, this.provider);
  }

  // Create payment intent for subscription
  async createSubscriptionPayment(apiProvider: string, amount: string, usageData: string) {
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.createPaymentIntent(
      apiProvider,
      ethers.utils.parseEther(amount),
      ethers.utils.toUtf8Bytes(usageData)
    );
    
    return tx;
  }

  // Get user reputation score
  async getReputationScore(walletAddress: string): Promise<number> {
    const score = await this.contract.getReputation(walletAddress);
    return score.toNumber();
  }

  // Get payment history
  async getPaymentHistory(walletAddress: string) {
    const history = await this.contract.getPaymentHistory(walletAddress);
    return history;
  }

  // Set spend limits (Developer Guardrails)
  async setSpendLimit(limit: string) {
    const signer = this.provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.setSpendLimit(
      ethers.utils.parseEther(limit)
    );
    
    return tx;
  }
}

export const x402Service = new X402Service();