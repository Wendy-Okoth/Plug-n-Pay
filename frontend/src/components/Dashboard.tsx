import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState } from 'react';

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
      setManualWalletInput(''); // Clear input after successful connection
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
  };

  // Test function to simulate developer registration
  const handleRegisterDeveloper = async () => {
    if (!address) return;
    
    try {
      // For now, we'll simulate the API call
      const mockApiKey = `pn_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      setApiKey(mockApiKey);
      
      // In the next step, we'll replace this with real API call
      alert(`Developer registered successfully!\nAPI Key: ${mockApiKey}\n\nIn the next step, this will call your real backend API.`);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Check console for details.');
    }
  };

  return (
    <div className="p-6">
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
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Plug-n-Pay Dashboard</h2>
            <p className="text-gray-600 mb-4">
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
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Developer Tools</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Register as a developer and create subscription plans for your API.
                  </p>
                  <button 
                    onClick={handleRegisterDeveloper}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Register Developer
                  </button>
                  
                  {apiKey && (
                    <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-semibold text-green-800 mb-1">✅ Developer Registered!</p>
                      <p className="text-xs font-mono break-all bg-green-100 p-2 rounded">
                        API Key: {apiKey}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Next: We'll connect this to your real backend API
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">API Consumer</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Access paid APIs using x402 micro-transactions.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Test Payment Flow
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    This will test the x402 payment intent flow
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}