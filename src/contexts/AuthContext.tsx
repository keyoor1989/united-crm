
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole, Permission } from "@/types/auth";
import { rolePermissions } from "@/utils/rbac/rolePermissions";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for an existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user data from app_users table
          const { data: userData, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            throw error;
          }
          
          if (userData) {
            const appUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              mobile: userData.mobile,
              role: userData.role as UserRole,
              branch: userData.branch,
              isActive: userData.is_active,
              hasSetPassword: userData.has_set_password,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at
            };
            
            setUser(appUser);
          }
        } else {
          // Fallback to localStorage for development
          const savedUser = localStorage.getItem("currentUser");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        // Clear any invalid session data
        localStorage.removeItem("currentUser");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in, fetch their data
          const { data: userData, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && userData) {
            const appUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              mobile: userData.mobile,
              role: userData.role as UserRole,
              branch: userData.branch,
              isActive: userData.is_active,
              hasSetPassword: userData.has_set_password,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at
            };
            
            setUser(appUser);
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          setUser(null);
          localStorage.removeItem("currentUser");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === "super_admin") return true;
    
    // Check if user role has the specific permission
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Try to authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Fetch user profile from app_users
        const { data: userData, error: userError } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (userError) throw userError;
        
        // Create User object
        const appUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          role: userData.role as UserRole,
          branch: userData.branch,
          isActive: userData.is_active,
          hasSetPassword: userData.has_set_password,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at
        };
        
        setUser(appUser);
        localStorage.setItem("currentUser", JSON.stringify(appUser));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${appUser.name}`,
        });
        
        navigate("/");
      } else {
        // Fallback to mock authentication for development
        const foundUser = mockUsers.find(u => 
          u.email === email && u.isActive
        );
        
        if (!foundUser) {
          throw new Error("Invalid credentials or inactive account");
        }
        
        setUser(foundUser);
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        
        toast({
          title: "Login successful (mock)",
          description: `Welcome back, ${foundUser.name}`,
        });
        
        navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("currentUser");
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out",
      });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      // Update the user in the database
      if (user.id) {
        const { error } = await supabase
          .from('app_users')
          .update({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            role: userData.role,
            branch: userData.branch,
            is_active: userData.isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      // Update local state
      const updatedUser = {
        ...user,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasPermission,
        hasRole,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Mock users for development/testing when Supabase auth is not available
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@unitedcopier.com",
    mobile: "9876543210",
    role: "super_admin",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Sales User",
    email: "sales@unitedcopier.com",
    mobile: "9876543211",
    role: "sales",
    branch: "Main Branch",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
