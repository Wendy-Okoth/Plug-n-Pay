import express from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { DeveloperService } from '../services/DeveloperService';
import { Developer } from '../models/Developer';

const router = express.Router();
const subscriptionService = new SubscriptionService();
const developerService = new DeveloperService();

// Middleware to authenticate developer
const authenticateDeveloper = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const developer = await developerService.getDeveloperByApiKey(apiKey);
    
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    // Type assertion as quick fix
    (req as any).developer = developer;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Create a new subscription plan
router.post('/plans', authenticateDeveloper, async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, price_per_call, daily_cap, monthly_cap } = req.body;
    
    if (!name || !price_per_call) {
      return res.status(400).json({ 
        error: 'Name and price_per_call are required' 
      });
    }

    // Type assertion as quick fix
    const developer = (req as any).developer as Developer;
    if (!developer) {
      return res.status(401).json({ error: 'Developer authentication required' });
    }

    const plan = await subscriptionService.createPlan({
      developer_id: developer.id,
      name,
      description,
      price_per_call,
      daily_cap,
      monthly_cap
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create subscription plan' });
  }
});

// Get all plans for a developer
router.get('/plans', authenticateDeveloper, async (req: express.Request, res: express.Response) => {
  try {
    // Type assertion as quick fix
    const developer = (req as any).developer as Developer;
    if (!developer) {
      return res.status(401).json({ error: 'Developer authentication required' });
    }

    const plans = await subscriptionService.getPlansByDeveloper(developer.id);
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

export default router;