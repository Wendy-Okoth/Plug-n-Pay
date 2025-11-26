export interface Developer {
  id: string;
  api_key: string;
  wallet_address: string;
  company_name?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeveloperDTO {
  wallet_address: string;
  company_name?: string;
  email?: string;
}