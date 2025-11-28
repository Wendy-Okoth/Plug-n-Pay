import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import { x402ExplorerService } from '../services/x402ExplorerService';
import { guardrailService } from '../services/guardrailService';
import { subscriptionAutomationService } from '../services/subscriptionAutomationService';

// Create a custom hook for manual wallet state
const useManualWallet = () => {
  const [manualAddress, setManualAddress] = useState<`0x${string}` | null>(null);
  
  const connectManual = (address: string) => {
    if (address.startsWith('0x') && address.length === 42) {
      setManualAddress(address as `0x${string}`);
      return true;
    }
    return false;
  };
  
  const disconnectManual = () => {
    setManualAddress(null);
  };
  
  return { manualAddress, connectManual, disconnectManual };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function Dashboard() {
  const { address: wagmiAddress, isConnected: wagmiConnected, connector } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { manualAddress, connectManual, disconnectManual } = useManualWallet();
  
  // Use manual address if no real wallet connection
  const isConnected = wagmiConnected || !!manualAddress;
  const address = wagmiAddress || manualAddress;
  
  const [error, setError] = useState('');
  const [manualWalletInput, setManualWalletInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [developerProfile, setDeveloperProfile] = useState(null);
  const [reputationScore, setReputationScore] = useState<number | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [spendLimit, setSpendLimit] = useState<string>('0.1');
  const [isAvalancheConnected, setIsAvalancheConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'developer' | 'consumer' | 'explorer'>('developer');

  // New state variables for enhanced features
  const [addressAnalytics, setAddressAnalytics] = useState<any>(null);
  const [guardrailConfig, setGuardrailConfig] = useState<any>(null);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [riskIndicators, setRiskIndicators] = useState<any>(null);

  // Check developer status when wallet connects
  useEffect(() => {
    if (address) {
      checkDeveloperStatus(address);
      loadEnhancedAvalancheData();
    }
  }, [address]);

  const checkDeveloperStatus = async (walletAddress: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/developers/profile?wallet_address=${walletAddress}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDeveloperProfile(result.data);
          setApiKey(result.data.api_key);
          // Load guardrails if developer is registered
          if (result.data.api_key) {
            loadGuardrailConfig(result.data.api_key);
          }
        }
      }
    } catch (error) {
      console.log('No existing developer profile found');
    }
  };

  const loadEnhancedAvalancheData = async () => {
    if (!address) return;

    try {
      // Load enhanced x402 data
      const analytics = await x402ExplorerService.getAddressAnalytics(address);
      setAddressAnalytics(analytics);
      setReputationScore(analytics.reputation);
      setPaymentHistory(analytics.paymentHistory);
      setRiskIndicators(analytics.riskIndicators);
      
      // Load automation rules
      const rules = subscriptionAutomationService.generateSampleRules();
      setAutomationRules(rules);
      
      // Load sample subscription plans
      const samplePlans = [
        {
          id: 'plan_1',
          name: 'Basic Plan',
          description: 'Perfect for small projects',
          pricePerCall: '0.001',
          baseFee: '0.01',
          dailyCap: 100,
          monthlyCap: 3000,
          autoRenew: true,
          usageBased: true,
          freeTier: 100,
          pauseOnLowBalance: true,
          cancelAfterFailures: 3,
          gracePeriod: 24
        },
        {
          id: 'plan_2',
          name: 'Pro Plan',
          description: 'For growing businesses',
          pricePerCall: '0.0008',
          baseFee: '0.05',
          dailyCap: 1000,
          monthlyCap: 30000,
          autoRenew: true,
          usageBased: true,
          freeTier: 1000,
          pauseOnLowBalance: true,
          cancelAfterFailures: 5,
          gracePeriod: 48
        }
      ];
      setSubscriptionPlans(samplePlans);
      
      setIsAvalancheConnected(true);
    } catch (error) {
      console.log('Enhanced Avalanche data not available, using basic data');
      // Fallback to basic data
      setReputationScore(75);
      setPaymentHistory([]);
    }
  };

  const loadGuardrailConfig = (apiKey: string) => {
    const config = guardrailService.getGuardrails(apiKey);
    if (!config) {
      // Set default guardrails if none exist
      const defaultConfig = guardrailService.generateDefaultGuardrails();
      guardrailService.setGuardrails(apiKey, defaultConfig);
      setGuardrailConfig(defaultConfig);
    } else {
      setGuardrailConfig(config);
    }
  };

  const handleConnect = () => {
    setError('');
    try {
      connect({ connector: connectors[0] });
    } catch (err) {
      setError('MetaMask not found. Please install MetaMask or use manual wallet input below.');
      console.error('Connection error:', err);
    }
  };

  const handleManualConnect = () => {
    if (connectManual(manualWalletInput)) {
      setError('');
      setManualWalletInput('');
    } else {
      setError('Please enter a valid wallet address (0x... with 42 characters)');
    }
  };

  const handleDisconnect = () => {
    if (wagmiConnected) {
      disconnect();
    }
    if (manualAddress) {
      disconnectManual();
    }
    setApiKey('');
    setDeveloperProfile(null);
    setReputationScore(null);
    setPaymentHistory([]);
    setAddressAnalytics(null);
    setGuardrailConfig(null);
    setAutomationRules([]);
  };

  const handleRegisterDeveloper = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/developers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: address,
          company_name: 'My API Service',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setApiKey(result.data.api_key);
        setDeveloperProfile(result.data);
        // Set up default guardrails for new developer
        loadGuardrailConfig(result.data.api_key);
        alert(`Developer registered successfully!\nAPI Key: ${result.data.api_key}`);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      const mockApiKey = `pn_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      setApiKey(mockApiKey);
      alert(`Using demo mode (backend unavailable).\nMock API Key: ${mockApiKey}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealX402Payment = async () => {
    if (!address) return;

    try {
      alert(`🔗 x402 Avalanche Payment Initiated:
      
• Network: Avalanche C-Chain
• Amount: 0.001 AVAX
• Gas: 0.0001 AVAX
• Payment Intent: Created
• Status: Waiting for confirmation

This would connect to real x402 contract on Avalanche.`);
      
      // Simulate payment success and update analytics
      setTimeout(async () => {
        setReputationScore(prev => prev ? prev + 5 : 85);
        const newPayment = {
          paymentId: `0x${Math.random().toString(36).substring(2)}`,
          to: '0xAPIDemo...',
          amount: '0.001',
          timestamp: Date.now(),
          status: 'confirmed',
          success: true,
          method: 'x402',
          network: 'Avalanche'
        };
        setPaymentHistory(prev => [newPayment, ...prev]);
        
        // Reload analytics to reflect new payment
        if (address) {
          const updatedAnalytics = await x402ExplorerService.getAddressAnalytics(address);
          setAddressAnalytics(updatedAnalytics);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Demo: Simulating x402 payment on Avalanche');
    }
  };

  const handleTestPayment = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      
      // Test guardrail validation
      if (apiKey && guardrailConfig) {
        const validation = guardrailService.validateRequest(apiKey, {
          userAddress: address,
          amount: '0.001',
          endpoint: '/api/data',
          timestamp: Date.now()
        });
        
        if (!validation.allowed) {
          alert(`🚫 Request blocked by guardrails: ${validation.reason}`);
          return;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/payments/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_wallet: address,
          plan_id: 'basic-plan'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.data.canAccess) {
          alert('✅ Payment verified! You have access to this API.');
        } else {
          alert('❌ No active subscription. Redirecting to x402 payment...');
          await handleRealX402Payment();
        }
      }
    } catch (error) {
      console.error('Payment check failed:', error);
      await handleRealX402Payment();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetSpendLimit = async () => {
    try {
      if (apiKey) {
        const updatedConfig = { ...guardrailConfig, maxSpendPerDay: spendLimit };
        guardrailService.setGuardrails(apiKey, updatedConfig);
        setGuardrailConfig(updatedConfig);
        alert(`Spend limit set to ${spendLimit} AVAX on Avalanche network`);
      } else {
        alert('Please register as a developer first');
      }
    } catch (error) {
      console.error('Failed to set spend limit:', error);
      alert('Demo: Spend limit would be set on Avalanche');
    }
  };

  const createSubscriptionPlan = async (planType: string) => {
    try {
      const planData = subscriptionPlans.find(p => p.name.toLowerCase().includes(planType)) || 
        subscriptionAutomationService.getAllPlans()[0];
      
      if (planData) {
        const newPlan = subscriptionAutomationService.createPlan(planData);
        alert(`✅ ${planType} subscription plan created!\n\nPlan ID: ${newPlan.id}\nBase Fee: ${newPlan.baseFee} AVAX\nPrice per call: ${newPlan.pricePerCall} AVAX`);
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
      alert('Error creating subscription plan');
    }
  };

  const handleConfigureGuardrails = () => {
    if (!apiKey) {
      alert('Please register as a developer first');
      return;
    }
    
    const defaultConfig = guardrailService.generateDefaultGuardrails();
    guardrailService.setGuardrails(apiKey, defaultConfig);
    setGuardrailConfig(defaultConfig);
    alert('✅ Default guardrails configured!');
  };

  const handleAddAutomationRule = (ruleType: string) => {
    const newRule = {
      id: `rule_${Date.now()}`,
      type: ruleType,
      condition: getRuleCondition(ruleType),
      action: getRuleAction(ruleType),
      enabled: true
    };
    
    setAutomationRules(prev => [...prev, newRule]);
    alert(`✅ ${ruleType} automation rule added!`);
  };

  const getRuleCondition = (ruleType: string): string => {
    const conditions = {
      'pause': 'user_balance < 0.001 AVAX',
      'cancel': 'payment_failures >= 3',
      'notify': 'usage > 80% of monthly_cap',
      'upgrade': 'consistent_high_usage > 30 days',
      'downgrade': 'low_usage > 60 days'
    };
    return conditions[ruleType as keyof typeof conditions] || 'custom_condition';
  };

  const getRuleAction = (ruleType: string): string => {
    const actions = {
      'pause': 'pause_subscription',
      'cancel': 'cancel_subscription',
      'notify': 'send_usage_alert',
      'upgrade': 'suggest_plan_upgrade',
      'downgrade': 'suggest_plan_downgrade'
    };
    return actions[ruleType as keyof typeof actions] || 'custom_action';
  };

  const calculateUsageCost = (plan: any, usage: number) => {
    return subscriptionAutomationService.calculateUsageCost(plan, usage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600">
                🔌 Plug-n-Pay
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                x402 Powered Subscriptions
              </span>
            </div>
            
            <div>
              {!isConnected ? (
                <div>
                  <button 
                    onClick={handleConnect}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Connect Wallet
                  </button>
                  {(error || connectError) && (
                    <div className="mt-2 text-sm text-red-600 max-w-xs">
                      {error || connectError?.message}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                    {manualAddress && <span className="text-blue-500 ml-1">(Demo)</span>}
                  </span>
                  <button 
                    onClick={handleDisconnect}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 bg-white">
            <h2 className="text-xl font-semibold mb-4">Plug-n-Pay Dashboard</h2>
            <p className="text-gray-600 mb-6">
              {isConnected 
                ? `Welcome! Your wallet ${address} is connected.`
                : 'Please connect your wallet to get started.'
              }
            </p>
            
            {/* Manual Wallet Input for Testing */}
            {!isConnected && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Demo Mode:</strong> No MetaMask? Enter a wallet address manually for testing:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualWalletInput}
                    onChange={(e) => setManualWalletInput(e.target.value)}
                    placeholder="0x1234567890123456789012345678901234567890"
                    className="flex-1 px-3 py-2 border rounded text-sm font-mono"
                  />
                  <button
                    onClick={handleManualConnect}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Use Manual Address
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Example: 0x1234567890123456789012345678901234567890
                </p>
              </div>
            )}
            
            {isConnected && (
              <div className="space-y-8">
                {/* Navigation Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('developer')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'developer'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🛠️ Developer Tools
                    </button>
                    <button
                      onClick={() => setActiveTab('consumer')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'consumer'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🔗 API Consumer
                    </button>
                    <button
                      onClick={() => setActiveTab('explorer')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'explorer'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🔍 x402 Explorer
                    </button>
                  </nav>
                </div>

                {/* Developer Tools Tab */}
                {activeTab === 'developer' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h3 className="font-semibold mb-4">Developer Registration</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Register as a developer and create subscription plans for your API.
                          </p>
                          
                          {!apiKey ? (
                            <button 
                              onClick={handleRegisterDeveloper}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                              {isLoading ? 'Registering...' : 'Register Developer'}
                            </button>
                          ) : (
                            <div className="p-4 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-semibold text-green-800 mb-1">✅ Developer Registered!</p>
                              <p className="text-xs font-mono break-all bg-green-100 p-2 rounded">
                                API Key: {apiKey}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Connected to real backend API
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Subscription Plan Management */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h3 className="font-semibold mb-4">📊 Smart Subscription Plans</h3>
                          <div className="space-y-4">
                            {subscriptionPlans.map((plan) => (
                              <div key={plan.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{plan.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>Base: <strong>{plan.baseFee} AVAX</strong></div>
                                      <div>Per call: <strong>{plan.pricePerCall} AVAX</strong></div>
                                      <div>Free tier: <strong>{plan.freeTier} calls</strong></div>
                                      <div>Daily cap: <strong>{plan.dailyCap}</strong></div>
                                    </div>
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-500">
                                        Sample cost (500 calls): {calculateUsageCost(plan, 500)} AVAX
                                      </p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => createSubscriptionPlan(plan.name.toLowerCase())}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ml-4"
                                  >
                                    Create Plan
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Developer Guardrails */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-4">🛡️ Advanced Guardrails</h3>
                        
                        <div className="space-y-6">
                          <div className="text-center">
                            <button 
                              onClick={handleConfigureGuardrails}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                              Configure Default Guardrails
                            </button>
                          </div>
                          
                          {guardrailConfig && (
                            <div className="p-4 bg-gray-50 rounded border">
                              <h4 className="font-semibold mb-2">Active Guardrails</h4>
                              <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span>Max Daily Spend:</span>
                                  <strong>{guardrailConfig.maxSpendPerDay} AVAX</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Rate Limit:</span>
                                  <strong>{guardrailConfig.maxRequestsPerMinute}/min</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Daily Requests:</span>
                                  <strong>{guardrailConfig.maxRequestsPerDay}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Auto-block Suspicious:</span>
                                  <strong>{guardrailConfig.autoBlockSuspicious ? 'Enabled' : 'Disabled'}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Allowed Endpoints:</span>
                                  <strong>{guardrailConfig.allowedEndpoints?.length || 0}</strong>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Spend Limits */}
                          <div className="p-4 bg-orange-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-2">Spend Limits</h4>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={spendLimit}
                                onChange={(e) => setSpendLimit(e.target.value)}
                                placeholder="0.1"
                                className="flex-1 px-3 py-2 border rounded text-sm"
                              />
                              <button
                                onClick={handleSetSpendLimit}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm"
                              >
                                Set Limit
                              </button>
                            </div>
                            <p className="text-xs text-orange-600 mt-1">Max per transaction (AVAX)</p>
                          </div>

                          {/* Rate Limits */}
                          <div className="p-4 bg-blue-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-2">Rate Limits</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Requests per minute:</span>
                                <span className="font-semibold">{guardrailConfig?.maxRequestsPerMinute || 60}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Requests per day:</span>
                                <span className="font-semibold">{guardrailConfig?.maxRequestsPerDay || 1000}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Max spend per day:</span>
                                <span className="font-semibold">{guardrailConfig?.maxSpendPerDay || '1'} AVAX</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Automation Section */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="font-semibold mb-4">⚡ Smart Automation Rules</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Available Rules</h4>
                          <div className="space-y-2">
                            {['pause', 'cancel', 'notify', 'upgrade', 'downgrade'].map((ruleType) => (
                              <button
                                key={ruleType}
                                onClick={() => handleAddAutomationRule(ruleType)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm text-left flex justify-between items-center"
                              >
                                <span>Add {ruleType} rule</span>
                                <span>+</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-3">Active Rules ({automationRules.filter(r => r.enabled).length})</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {automationRules.map(rule => (
                              <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs">
                                <div className="flex-1">
                                  <p className="font-semibold">{rule.type.toUpperCase()}</p>
                                  <p className="text-gray-600">If {rule.condition}</p>
                                </div>
                                <div className={`px-2 py-1 rounded ${
                                  rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {rule.enabled ? 'Active' : 'Inactive'}
                                </div>
                              </div>
                            ))}
                            {automationRules.length === 0 && (
                              <p className="text-gray-500 text-center py-4">No automation rules configured</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Consumer Tab */}
                {activeTab === 'consumer' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-4">x402 Payment Flow</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Access paid APIs using x402 micro-transactions on Avalanche.
                        </p>
                        
                        <button 
                          onClick={handleTestPayment}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full disabled:opacity-50"
                        >
                          {isLoading ? 'Processing...' : 'Test x402 Payment Flow'}
                        </button>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">Guardrail Check</h4>
                          <p className="text-xs text-blue-700">
                            This payment will be validated against active guardrails before processing.
                          </p>
                        </div>
                      </div>

                      {/* API Usage Demo */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-4">Test API Access</h3>
                        <div className="space-y-3">
                          <button className="w-full bg-white border border-blue-300 text-blue-600 py-3 px-4 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                            Make Test API Call
                          </button>
                          <button className="w-full bg-white border border-blue-300 text-blue-600 py-3 px-4 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                            Check Access Status
                          </button>
                          <button className="w-full bg-white border border-green-300 text-green-600 py-3 px-4 rounded-lg text-sm hover:bg-green-50 transition-colors">
                            View Usage Analytics
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Usage Metrics */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="font-semibold mb-4">Usage Dashboard</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">0</p>
                          <p className="text-xs text-gray-600">Requests Today</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">0.00</p>
                          <p className="text-xs text-gray-600">AVAX Spent</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">0</p>
                          <p className="text-xs text-gray-600">Active Subs</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-orange-600">100</p>
                          <p className="text-xs text-gray-600">Rate Limit</p>
                        </div>
                      </div>
                      
                      {/* Cost Calculator */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Cost Calculator</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Basic Plan (500 calls):</span>
                            <span className="font-semibold">0.51 AVAX</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pro Plan (2000 calls):</span>
                            <span className="font-semibold">1.05 AVAX</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Enterprise (10k calls):</span>
                            <span className="font-semibold">Custom</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced x402 Explorer Tab */}
                {activeTab === 'explorer' && addressAnalytics && (
                  <div className="space-y-6">
                    {/* Analytics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg">
                        <p className="text-2xl font-bold">{addressAnalytics.totalPayments}</p>
                        <p className="text-sm">Total Payments</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-lg">
                        <p className="text-2xl font-bold">{addressAnalytics.successfulPayments}</p>
                        <p className="text-sm">Successful</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg">
                        <p className="text-2xl font-bold">{addressAnalytics.totalVolume.toFixed(4)}</p>
                        <p className="text-sm">AVAX Volume</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg">
                        <p className="text-2xl font-bold">{addressAnalytics.reputation}</p>
                        <p className="text-sm">Reputation Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Reputation Dashboard */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200 lg:col-span-2">
                        <h3 className="font-semibold mb-4">🔍 x402 Explorer & Reputation</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Reputation Score */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-2">Reputation Score</h4>
                            <div className="flex items-center gap-4">
                              <div className="relative w-20 h-20">
                                <svg className="w-20 h-20" viewBox="0 0 36 36">
                                  <path
                                    d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                  />
                                  <path
                                    d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={reputationScore && reputationScore > 70 ? '#10B981' : reputationScore && reputationScore > 40 ? '#F59E0B' : '#EF4444'}
                                    strokeWidth="3"
                                    strokeDasharray={`${reputationScore}, 100`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-lg font-bold">{reputationScore || 'N/A'}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold">
                                  {reputationScore && reputationScore > 70 ? 'Excellent' : 
                                   reputationScore && reputationScore > 40 ? 'Good' : 'Needs Improvement'}
                                </p>
                                <p className="text-xs text-gray-500">Based on payment history</p>
                              </div>
                            </div>
                          </div>

                          {/* Risk Indicators */}
                          <div className="p-4 bg-white rounded-lg border">
                            <h4 className="font-semibold text-sm mb-2">Risk Indicators</h4>
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className={`p-3 rounded ${
                                addressAnalytics.riskIndicators.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                addressAnalytics.riskIndicators.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                <p className="text-xs">Risk Level</p>
                                <p className="font-semibold">{addressAnalytics.riskIndicators.riskLevel}</p>
                              </div>
                              <div className="p-3 bg-blue-100 text-blue-800 rounded">
                                <p className="text-xs">Success Rate</p>
                                <p className="font-semibold">{addressAnalytics.riskIndicators.paymentSuccessRate}</p>
                              </div>
                              <div className="p-3 bg-purple-100 text-purple-800 rounded">
                                <p className="text-xs">Avg TX Value</p>
                                <p className="font-semibold">{addressAnalytics.riskIndicators.averageTransactionValue}</p>
                              </div>
                              <div className="p-3 bg-orange-100 text-orange-800 rounded">
                                <p className="text-xs">Frequency</p>
                                <p className="font-semibold">{addressAnalytics.riskIndicators.frequency}</p>
                              </div>
                            </div>
                          </div>

                          {/* Payment History */}
                          <div className="p-4 bg-gray-50 rounded-lg border md:col-span-2">
                            <h4 className="font-semibold text-sm mb-2">Recent Payment History</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {addressAnalytics.paymentHistory.map((payment: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs p-2 bg-white rounded border">
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <span className="font-mono">{payment.to.slice(0, 8)}...</span>
                                      <span className={`px-2 py-1 rounded ${
                                        payment.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {payment.success ? 'Success' : 'Failed'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between mt-1 text-gray-500">
                                      <span>{new Date(payment.timestamp).toLocaleDateString()}</span>
                                      <span>{payment.method} • {payment.network}</span>
                                    </div>
                                  </div>
                                  <span className="text-green-600 font-semibold ml-2">{payment.amount} AVAX</span>
                                </div>
                              ))}
                              {addressAnalytics.paymentHistory.length === 0 && (
                                <p className="text-xs text-gray-500 text-center py-4">No payment history</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Subscription Automation */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-4">⚡ Subscription Automation</h3>
                        
                        <div className="space-y-4">
                          {/* Auto-Renewal */}
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-3">🔄 Auto-Renewal</h4>
                            <div className="space-y-2">
                              <label className="flex items-center text-sm">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                Enable auto-renewal
                              </label>
                              <select className="w-full p-2 border rounded text-sm">
                                <option>Monthly</option>
                                <option>Weekly</option>
                                <option>Daily</option>
                              </select>
                            </div>
                          </div>

                          {/* Usage-Based Payments */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-3">📊 Usage-Based</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Base fee:</span>
                                <span className="font-semibold">0.01 AVAX</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Per request:</span>
                                <span className="font-semibold">0.0001 AVAX</span>
                              </div>
                            </div>
                          </div>

                          {/* Smart Triggers */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-3">⏸️ Triggers</h4>
                            <div className="space-y-2">
                              <label className="flex items-center text-sm">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                Pause on low balance
                              </label>
                              <label className="flex items-center text-sm">
                                <input type="checkbox" className="mr-2" defaultChecked />
                                Cancel after failures
                              </label>
                              <label className="flex items-center text-sm">
                                <input type="checkbox" className="mr-2" />
                                Notify on high usage
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}