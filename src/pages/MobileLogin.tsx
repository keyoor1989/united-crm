
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFormLayout } from "@/components/mobile/MobileFormLayout";
import { useCapacitorCamera } from "@/hooks/use-capacitor-camera";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isCapacitorEnvironment } from "@/utils/mobileCompatibility";

// Define zod schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const MobileLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { isAvailable: isBiometricAvailable, authenticate: biometricAuth, getCredentials } = useBiometricAuth();
  const [showBiometricLogin, setShowBiometricLogin] = useState(false);
  
  // Check if we're running in a Capacitor environment
  const isNative = isCapacitorEnvironment();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Check if biometric login is available
  useEffect(() => {
    const checkBiometricCredentials = async () => {
      if (isBiometricAvailable && isNative) {
        try {
          // Check if we have stored credentials
          const hasCredentials = await getCredentials("unitedcrm.app");
          setShowBiometricLogin(!!hasCredentials);
        } catch (error) {
          console.error("Failed to check for biometric credentials:", error);
          setShowBiometricLogin(false);
        }
      }
    };

    checkBiometricCredentials();
  }, [isBiometricAvailable, isNative, getCredentials]);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setLoginError(null);
      console.log(`Attempting login for: ${data.email}`);
      
      await login(data.email, data.password);
      // Redirect will happen via useEffect when auth state updates
    } catch (error) {
      console.error("Login failed:", error);
      
      let errorMessage = "Failed to login. Please check your credentials.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      // First authenticate using biometrics
      const verified = await biometricAuth({
        reason: "Login to United CRM",
        title: "Biometric Authentication",
      });
      
      if (verified) {
        // If verified, get stored credentials
        const credentials = await getCredentials("unitedcrm.app");
        
        if (credentials) {
          // Use credentials to log in
          await login(credentials.username, credentials.password);
        }
      }
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      setLoginError("Biometric authentication failed. Please use email and password.");
    }
  };

  // Show loading indicator for both form submission and auth context
  const isLoading = isSubmitting || authLoading;

  // Use mobile layout on mobile devices, otherwise render regular Login page
  if (!isMobile) {
    // Return normal login page for desktop
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <MobileFormLayout
        title="United Copier CRM"
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={isLoading}
      >
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@unitedcopier.com"
                      {...field}
                      disabled={isLoading}
                      autoComplete="email"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-12 mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            
            {showBiometricLogin && (
              <Button type="button" variant="outline" className="w-full h-12 mt-2" onClick={handleBiometricAuth} disabled={isLoading}>
                Use Fingerprint / Face ID
              </Button>
            )}
          </div>
        </Form>
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>
            For demo: use admin@unitedcopier.com, sales@unitedcopier.com, or copierbazar@gmail.com with password: 123456
          </p>
        </div>
      </MobileFormLayout>
    </div>
  );
};

export default MobileLogin;
