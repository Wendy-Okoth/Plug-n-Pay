import { pool } from '../config/database';
import { Developer, CreateDeveloperDTO } from '../models/Developer';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class DeveloperService {
  
  private generateApiKey(): string {
    // Generate shorter API key (32 bytes = 64 hex chars max)
    return `pn_${crypto.randomBytes(16).toString('hex')}`; // 16 bytes = 32 hex chars
  }

  async createDeveloper(data: CreateDeveloperDTO): Promise<Developer> {
    const client = await pool.connect();
    
    try {
      const apiKey = this.generateApiKey();
      const id = uuidv4();
      
      console.log('Creating developer with API key length:', apiKey.length);
      
      const query = `
        INSERT INTO developers (id, api_key, wallet_address, company_name, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [id, apiKey, data.wallet_address, data.company_name, data.email];
      
      const result = await client.query(query, values);
      console.log('Developer created successfully');
      
      return result.rows[0];
    } catch (error: any) {
      console.error('Database error in createDeveloper:', error);
      throw new Error(`Failed to create developer: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async getDeveloperByApiKey(apiKey: string): Promise<Developer | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM developers WHERE api_key = $1';
      const result = await client.query(query, [apiKey]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getDeveloperByWallet(walletAddress: string): Promise<Developer | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM developers WHERE wallet_address = $1';
      const result = await client.query(query, [walletAddress]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }
}