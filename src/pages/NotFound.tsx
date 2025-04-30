
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  // Check if this is a customer form with ID that needs to be redirected
  const path = location.pathname;
  const isCustomerFormWithId = path.startsWith('/customer-form/');
  
  // If it's a customer form with ID, extract the ID
  const customerId = isCustomerFormWithId ? path.split('/customer-form/')[1] : null;
  const redirectPath = customerId ? `/customer/${customerId}` : '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="text-6xl font-bold text-brand-500 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the page you're looking for: {location.pathname}
        </p>
        
        {isCustomerFormWithId ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-600">
              It looks like you're trying to access a customer form. Click below to go to the correct URL.
            </p>
            <Button asChild>
              <Link to={redirectPath} className="flex items-center gap-2">
                Go to Customer Page
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotFound;
