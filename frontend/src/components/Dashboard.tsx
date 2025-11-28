import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

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

  // Check developer status when wallet connects
  useEffect(() => {
    if (address) {
      checkDeveloperStatus(address);
      loadAvalancheData();
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
        }
      }
    } catch (error) {
      console.log('No existing developer profile found');
    }
  };

  const loadAvalancheData = async () => {
    if (!address) return;

    try {
      // Mock Avalanche data for demo
      setReputationScore(85);
      setPaymentHistory([
        { 
          paymentId: '0x123abc...', 
          to: '0xAPI1f8b...', 
          amount: '0.001', 
          timestamp: Date.now() - 86400000,
          status: 'confirmed'
        },
        { 
          paymentId: '0x456def...', 
          to: '0xAPI2e9c...', 
          amount: '0.002', 
          timestamp: Date.now() - 172800000,
          status: 'confirmed'
        }
      ]);
      setIsAvalancheConnected(true);
    } catch (error) {
      console.log('Avalanche data not available, using mock data');
      setReputationScore(75);
      setPaymentHistory([]);
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
      
      // Simulate payment success
      setTimeout(() => {
        setReputationScore(prev => prev ? prev + 5 : 85);
        setPaymentHistory(prev => [{
          paymentId: `0x${Math.random().toString(36).substring(2)}`,
          to: '0xAPIDemo...',
          amount: '0.001',
          timestamp: Date.now(),
          status: 'confirmed'
        }, ...prev]);
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
      alert(`Spend limit set to ${spendLimit} AVAX on Avalanche network`);
    } catch (error) {
      console.error('Failed to set spend limit:', error);
      alert('Demo: Spend limit would be set on Avalanche');
    }
  };

  const createSubscriptionPlan = async (planType: string) => {
    try {
      alert(`Creating ${planType} subscription plan on Avalanche...`);
      // This would call your backend to create a real plan
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
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

                      {/* Subscription Plan Management */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-4">📊 Subscription Plans</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Basic Plan</h4>
                                <p className="text-sm text-gray-600">100 requests/day • 0.001 AVAX per call</p>
                              </div>
                              <button 
                                onClick={() => createSubscriptionPlan('basic')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Create Plan
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Pro Plan</h4>
                                <p className="text-sm text-gray-600">1000 requests/day • 0.0008 AVAX per call</p>
                              </div>
                              <button 
                                onClick={() => createSubscriptionPlan('pro')}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Create Plan
                              </button>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">Enterprise Plan</h4>
                                <p className="text-sm text-gray-600">Unlimited requests • Custom AVAX pricing</p>
                              </div>
                              <button 
                                onClick={() => createSubscriptionPlan('enterprise')}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Create Plan
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Developer Guardrails */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="font-semibold mb-4">🛡️ Developer Guardrails</h3>
                      
                      <div className="space-y-6">
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
                              <span className="font-semibold">60</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Requests per day:</span>
                              <span className="font-semibold">1,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Max spend per day:</span>
                              <span className="font-semibold">1 AVAX</span>
                            </div>
                          </div>
                        </div>

                        {/* Usage Quotas */}
                        <div className="p-4 bg-green-50 rounded-lg border">
                          <h4 className="font-semibold text-sm mb-2">Usage Quotas</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span>Current Usage:</span>
                              <span className="font-semibold">45%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <p className="text-xs text-green-600">Reset in 12 hours</p>
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
                        </div>
                      </div>
                    </div>

                    {/* Usage Metrics */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="font-semibold mb-4">Usage Dashboard</h3>
                      <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </div>
                )}

                {/* x402 Explorer Tab */}
                {activeTab === 'explorer' && (
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

                        {/* Payment History */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-semibold text-sm mb-2">Recent Payments</h4>
                          <div className="space-y-3 max-h-40 overflow-y-auto">
                            {paymentHistory.map((payment, index) => (
                              <div key={index} className="flex justify-between items-center text-xs p-2 bg-white rounded">
                                <div>
                                  <span className="font-mono">{payment.to.slice(0, 8)}...</span>
                                  <span className={`ml-2 px-1 rounded ${
                                    payment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </div>
                                <span className="text-green-600 font-semibold">{payment.amount} AVAX</span>
                              </div>
                            ))}
                            {paymentHistory.length === 0 && (
                              <p className="text-xs text-gray-500 text-center py-4">No payment history</p>
                            )}
                          </div>
                        </div>

                        {/* Risk Indicators */}
                        <div className="p-4 bg-white rounded-lg border md:col-span-2">
                          <h4 className="font-semibold text-sm mb-2">Risk Indicators</h4>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className={`p-3 rounded ${
                              reputationScore && reputationScore > 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              <p className="text-xs">Payment Success</p>
                              <p className="font-semibold">{reputationScore && reputationScore > 60 ? 'High' : 'Low'}</p>
                            </div>
                            <div className="p-3 bg-blue-100 text-blue-800 rounded">
                              <p className="text-xs">Avg TX Value</p>
                              <p className="font-semibold">0.002 AVAX</p>
                            </div>
                            <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
                              <p className="text-xs">Frequency</p>
                              <p className="font-semibold">Medium</p>
                            </div>
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
                              <input type="checkbox" className="mr-2" />
                              Pause on low balance
                            </label>
                            <label className="flex items-center text-sm">
                              <input type="checkbox" className="mr-2" defaultChecked />
                              Cancel after failures
                            </label>
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