export interface ApiCustomer {
  id: string;
  wallet_address: string;
  current_balance: string;
  total_spent: string;
  created_at: Date;
  last_used_at?: Date;
}

export interface UsageLog {
  id: string;
  customer_id: string;
  plan_id: string;
  amount: string;
  payment_intent_hash?: string;
  api_endpoint?: string;
  timestamp: Date;
}