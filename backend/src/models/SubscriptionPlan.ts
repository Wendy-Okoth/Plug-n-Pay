export interface SubscriptionPlan {
  id: string;
  developer_id: string;
  name: string;
  description?: string;
  price_per_call: string; // in AVAX
  daily_cap?: string;
  monthly_cap?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePlanDTO {
  developer_id: string;
  name: string;
  description?: string;
  price_per_call: string;
  daily_cap?: string;
  monthly_cap?: string;
}