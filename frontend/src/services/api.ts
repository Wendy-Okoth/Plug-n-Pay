import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Developer API
export const developerAPI = {
  register: async (data: { wallet_address: string; company_name?: string; email?: string }) => {
    const response = await api.post('/developers/register', data);
    return response.data;
  },
  
  getProfile: async (apiKey: string) => {
    const response = await api.get('/developers/profile', {
      headers: { 'x-api-key': apiKey }
    });
    return response.data;
  }
};

// Subscription API
export const subscriptionAPI = {
  createPlan: async (apiKey: string, data: {
    name: string;
    description?: string;
    price_per_call: string;
    daily_cap?: string;
    monthly_cap?: string;
  }) => {
    const response = await api.post('/subscriptions/plans', data, {
      headers: { 'x-api-key': apiKey }
    });
    return response.data;
  },
  
  getPlans: async (apiKey: string) => {
    const response = await api.get('/subscriptions/plans', {
      headers: { 'x-api-key': apiKey }
    });
    return response.data;
  }
};

// Payment API
export const paymentAPI = {
  checkAccess: async (data: { customer_wallet: string; plan_id: string }) => {
    const response = await api.post('/payments/check-access', data);
    return response.data;
  },
  
  verifyPayment: async (data: { transaction_hash: string; customer_wallet: string; plan_id: string }) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  }
};

export default api;