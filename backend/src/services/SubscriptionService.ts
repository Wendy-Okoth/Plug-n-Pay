import { pool } from '../config/database';
import { SubscriptionPlan, CreatePlanDTO } from '../models/SubscriptionPlan';
import { v4 as uuidv4 } from 'uuid';

export class SubscriptionService {
  
  // Create a new subscription plan
  async createPlan(data: CreatePlanDTO): Promise<SubscriptionPlan> {
    const query = `
      INSERT INTO subscription_plans (id, developer_id, name, description, price_per_call, daily_cap, monthly_cap)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      uuidv4(),
      data.developer_id,
      data.name,
      data.description,
      data.price_per_call,
      data.daily_cap,
      data.monthly_cap
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create subscription plan: ${error}`);
    }
  }

  // Get plans by developer
  async getPlansByDeveloper(developerId: string): Promise<SubscriptionPlan[]> {
    const query = 'SELECT * FROM subscription_plans WHERE developer_id = $1 AND is_active = true ORDER BY created_at DESC';
    const result = await pool.query(query, [developerId]);
    return result.rows;
  }

  // Get plan by ID
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    const query = 'SELECT * FROM subscription_plans WHERE id = $1';
    const result = await pool.query(query, [planId]);
    return result.rows[0] || null;
  }
}