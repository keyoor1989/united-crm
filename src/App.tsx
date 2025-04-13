
import React from 'react';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VendorProvider } from '@/contexts/VendorContext';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VendorProvider>
        <Toaster />
        <AppRoutes />
      </VendorProvider>
    </QueryClientProvider>
  );
}

export default App;
