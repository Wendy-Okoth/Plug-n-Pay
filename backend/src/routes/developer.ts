import express from 'express';
import { DeveloperService } from '../services/DeveloperService';

const router = express.Router();
const developerService = new DeveloperService();

// Register a new developer
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { wallet_address, company_name, email } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const developer = await developerService.createDeveloper({
      wallet_address,
      company_name,
      email
    });

    res.status(201).json({
      success: true,
      data: {
        developer_id: developer.id,
        api_key: developer.api_key,
        wallet_address: developer.wallet_address
      }
    });
  } catch (error) {
    console.error('Developer registration error:', error);
    res.status(500).json({ error: 'Failed to register developer' });
  }
});

// Get developer profile by wallet address
router.get('/profile', async (req: express.Request, res: express.Response) => {
  try {
    const { wallet_address } = req.query;
    
    if (!wallet_address) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
    }

    const developer = await developerService.getDeveloperByWallet(wallet_address as string);
    
    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found'
      });
    }

    res.json({
      success: true,
      data: {
        developer_id: developer.id,
        wallet_address: developer.wallet_address,
        api_key: developer.api_key,
        company_name: developer.company_name,
        email: developer.email,
        created_at: developer.created_at
      }
    });
  } catch (error) {
    console.error('Developer profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get developer profile' 
    });
  }
});

// Get developer profile by API key (for authenticated requests)
router.get('/profile-by-key', async (req: express.Request, res: express.Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const developer = await developerService.getDeveloperByApiKey(apiKey);
    
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    res.json({
      success: true,
      data: {
        developer_id: developer.id,
        wallet_address: developer.wallet_address,
        company_name: developer.company_name,
        email: developer.email,
        created_at: developer.created_at
      }
    });
  } catch (error) {
    console.error('Developer profile error:', error);
    res.status(500).json({ error: 'Failed to get developer profile' });
  }
});

export default router;