
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
                <button 
                  onClick={() => connect({ connector: connectors[0] })}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button 
                    onClick={() => disconnect()}
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
            <p className="text-gray-600">
              {isConnected 
                ? `Welcome! Your wallet ${address} is connected.`
                : 'Please connect your wallet to get started.'
              }
            </p>
            
            {isConnected && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Developer Tools</h3>
                  <p className="text-sm text-gray-600">Register as a developer and create subscription plans for your API.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">API Consumer</h3>
                  <p className="text-sm text-gray-600">Access paid APIs using x402 micro-transactions.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}