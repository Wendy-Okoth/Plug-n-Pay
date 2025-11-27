import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { client } from './utils/wagmiConfig';
import { Dashboard } from './components/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig client={client}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
          <Dashboard />
        </div>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
