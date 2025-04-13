
import React from 'react';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VendorProvider } from '@/contexts/VendorContext';
import { TaskProvider } from '@/contexts/TaskContext';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VendorProvider>
        <TaskProvider>
          <Toaster />
          <AppRoutes />
        </TaskProvider>
      </VendorProvider>
    </QueryClientProvider>
  );
}

export default App;
