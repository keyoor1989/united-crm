import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Clear any stored auth data on login page load
  useEffect(() => {
    const checkSession = async () => {
      // Check if there are any stored sessions that might be invalid
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Login page: Clearing any stored session data");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("sidebar-expanded-state");
        
        // Force revalidation of authentication state
        try {
          // Clean up any potentially incorrect auth state
          await supabase.auth.signOut();
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
    
    checkSession();
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log("Login: User is authenticated, redirecting to dashboard");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
        console.error("Detailed error:", error.message);
        
        // More specific error messages
        switch (error.message.toLowerCase()) {
          case "invalid login credentials":
            errorMessage = "Incorrect email or password. Please try again.";
            break;
          case "user not found":
            errorMessage = "No account found with this email. Please sign up.";
            break;
          case "email not confirmed":
            errorMessage = "Please confirm your email before logging in.";
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator for both form submission and auth context
  const isLoading = isSubmitting || authLoading;

  // Render the rest of the component
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">United Copier CRM</CardTitle>
          <CardDescription>
            Enter your credentials to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" /> Please wait
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">
            For demo: use admin@unitedcopier.com, sales@unitedcopier.com, or copierbazar@gmail.com with password: 123456
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
