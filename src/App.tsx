
import React from 'react';
import { Toaster } from './components/ui/toaster';
import AppRoutes from './AppRoutes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VendorProvider } from '@/contexts/VendorContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { TelegramProvider } from '@/contexts/TelegramContext';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VendorProvider>
        <TaskProvider>
          <TelegramProvider>
            <Toaster />
            <AppRoutes />
          </TelegramProvider>
        </TaskProvider>
      </VendorProvider>
    </QueryClientProvider>
  );
}

export default App;
