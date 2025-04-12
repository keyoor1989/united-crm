
import { Toaster } from "@/components/ui/toaster";
import AppRoutes from "@/AppRoutes";
import { VendorProvider } from "@/contexts/VendorContext";

function App() {
  return (
    <>
      <VendorProvider>
        <AppRoutes />
        <Toaster />
      </VendorProvider>
    </>
  );
}

export default App;
