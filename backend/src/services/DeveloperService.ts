import { pool } from '../config/database';
import { Developer, CreateDeveloperDTO } from '../models/Developer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class DeveloperService {
  
  // Generate a secure API key
  private generateApiKey(): string {
    return `pn_${crypto.randomBytes(32).toString('hex')}`;
  }

  // Create a new developer
  async createDeveloper(data: CreateDeveloperDTO): Promise<Developer> {
    const apiKey = this.generateApiKey();
    const query = `
      INSERT INTO developers (id, api_key, wallet_address, company_name, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [uuidv4(), apiKey, data.wallet_address, data.company_name, data.email];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create developer: ${error}`);
    }
  }

  // Get developer by API key
  async getDeveloperByApiKey(apiKey: string): Promise<Developer | null> {
    const query = 'SELECT * FROM developers WHERE api_key = $1';
    const result = await pool.query(query, [apiKey]);
    return result.rows[0] || null;
  }

  // Get developer by wallet address
  async getDeveloperByWallet(walletAddress: string): Promise<Developer | null> {
    const query = 'SELECT * FROM developers WHERE wallet_address = $1';
    const result = await pool.query(query, [walletAddress]);
    return result.rows[0] || null;
  }
}