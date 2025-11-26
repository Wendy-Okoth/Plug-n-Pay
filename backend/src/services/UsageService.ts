import { pool } from '../config/database';
import { ApiCustomer, UsageLog } from '../models/Usage';
import { v4 as uuidv4 } from 'uuid';

export class UsageService {
  
  // Get or create API customer
  async getOrCreateCustomer(walletAddress: string): Promise<ApiCustomer> {
    // Try to find existing customer
    const findQuery = 'SELECT * FROM api_customers WHERE wallet_address = $1';
    const findResult = await pool.query(findQuery, [walletAddress]);
    
    if (findResult.rows[0]) {
      return findResult.rows[0];
    }
    
    // Create new customer
    const createQuery = `
      INSERT INTO api_customers (id, wallet_address)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const createResult = await pool.query(createQuery, [uuidv4(), walletAddress]);
    return createResult.rows[0];
  }

  // Log API usage
  async logUsage(customerId: string, planId: string, amount: string, paymentIntentHash?: string, endpoint?: string): Promise<UsageLog> {
    const query = `
      INSERT INTO usage_logs (id, customer_id, plan_id, amount, payment_intent_hash, api_endpoint)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [uuidv4(), customerId, planId, amount, paymentIntentHash, endpoint];
    
    try {
      const result = await pool.query(query, values);
      
      // Update customer's last used timestamp
      await pool.query(
        'UPDATE api_customers SET last_used_at = NOW() WHERE id = $1',
        [customerId]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to log usage: ${error}`);
    }
  }

  // Get customer usage statistics
  async getCustomerUsage(customerId: string, planId: string) {
    const dailyQuery = `
      SELECT COALESCE(SUM(amount), 0) as daily_total
      FROM usage_logs 
      WHERE customer_id = $1 AND plan_id = $2 
      AND timestamp >= CURRENT_DATE
    `;
    
    const monthlyQuery = `
      SELECT COALESCE(SUM(amount), 0) as monthly_total
      FROM usage_logs 
      WHERE customer_id = $1 AND plan_id = $2 
      AND timestamp >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    
    const [dailyResult, monthlyResult] = await Promise.all([
      pool.query(dailyQuery, [customerId, planId]),
      pool.query(monthlyQuery, [customerId, planId])
    ]);
    
    return {
      daily_total: dailyResult.rows[0].daily_total,
      monthly_total: monthlyResult.rows[0].monthly_total
    };
  }
}