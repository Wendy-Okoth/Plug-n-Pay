import express from 'express';
import { X402Service } from '../services/X402Service';
import { SubscriptionService } from '../services/SubscriptionService';

const router = express.Router();
const x402Service = new X402Service();
const subscriptionService = new SubscriptionService();

// Check access and get payment intent
router.post('/check-access', async (req: express.Request, res: express.Response) => {
  try {
    const { customer_wallet, plan_id } = req.body;
    
    if (!customer_wallet || !plan_id) {
      return res.status(400).json({ 
        error: 'customer_wallet and plan_id are required' 
      });
    }

    const result = await x402Service.checkAccess(customer_wallet, plan_id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

// Verify payment and grant access
router.post('/verify', async (req: express.Request, res: express.Response) => {
  try {
    const { transaction_hash, customer_wallet, plan_id } = req.body;
    
    if (!transaction_hash || !customer_wallet || !plan_id) {
      return res.status(400).json({ 
        error: 'transaction_hash, customer_wallet, and plan_id are required' 
      });
    }

    const granted = await x402Service.verifyAndGrantAccess(
      transaction_hash, 
      customer_wallet, 
      plan_id
    );

    res.json({
      success: true,
      data: { access_granted: granted }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;