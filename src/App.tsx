
import React from 'react';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
