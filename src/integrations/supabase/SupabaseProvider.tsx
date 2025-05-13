
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/auth";
import { supabase } from "./client";
import { Session } from "@supabase/supabase-js";

interface SupabaseContextType {
  user: User | null;
  isLoading: boolean;
  supabase: typeof supabase;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseContextProvider");
  }
  return context;
};

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseContextProvider = ({ children }: SupabaseProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for stored user data first
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }

    // Set up auth state listener first (best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        // If there's a user ID in the session, try to get user details
        if (session?.user) {
          // Use setTimeout to avoid potential recursive calls to Supabase
          setTimeout(async () => {
            try {
              // Check if user exists in the app_users table
              const { data: userData, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) throw error;

              if (userData) {
                const appUser: User = {
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  mobile: userData.mobile,
                  role: userData.role,
                  branch: userData.branch,
                  isActive: userData.is_active,
                  hasSetPassword: userData.has_set_password,
                  createdAt: userData.created_at,
                  updatedAt: userData.updated_at
                };
                setUser(appUser);
                localStorage.setItem("currentUser", JSON.stringify(appUser));
              } else if (session.user.email) {
                // Basic user info if not in app_users table
                const basicUser: User = {
                  id: session.user.id,
                  name: session.user.email.split('@')[0],
                  email: session.user.email,
                  role: "read_only",
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                setUser(basicUser);
                localStorage.setItem("currentUser", JSON.stringify(basicUser));
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          // If no user in session, clear user data
          setUser(null);
          localStorage.removeItem("currentUser");
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If no session is found, set loading to false
        if (!session) {
          setIsLoading(false);
        }
        // The auth state change handler will handle setting user data if session exists
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    isLoading,
    supabase
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
