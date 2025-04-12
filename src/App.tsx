
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "@/AppRoutes";
import { VendorProvider } from "@/contexts/VendorContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VendorProvider>
        <AppRoutes />
        <Toaster />
      </VendorProvider>
    </QueryClientProvider>
  );
}

export default App;
