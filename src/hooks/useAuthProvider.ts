
import { useState, useEffect } from "react";
import { User, UserRole, Permission } from "@/types/auth";
import { rolePermissions } from "@/utils/rbac/rolePermissions";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for an existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Set up auth state listener first (Supabase best practice)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            if (event === 'SIGNED_IN' && session) {
              // Use setTimeout to avoid recursion in auth state changes
              setTimeout(() => {
                fetchUserProfile(session.user.id);
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem("currentUser");
            }
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found, fetching user profile');
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Session check error:", error);
        // Clear any invalid session data
        localStorage.removeItem("currentUser");
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      // Fetch user data from app_users table
      const { data: userData, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
        return;
      }
      
      if (userData) {
        console.log('User profile found:', userData);
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
      } else {
        console.log('No user profile found for ID:', userId);
        
        // Get user email from auth data
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          console.log('Auth user found:', authUser);
          
          // Create a temporary admin user if the email matches admin pattern
          // This helps administrators to bootstrap their accounts
          const isAdmin = authUser.email?.includes("admin") || 
                          authUser.email === "copierbazar@gmail.com";
          const userRole: UserRole = isAdmin ? "super_admin" : "read_only";
            
          // Create a temporary basic user with appropriate permissions
          const tempUser: User = {
            id: userId,
            name: authUser.email?.split('@')[0] || 'New User',
            email: authUser.email || '',
            mobile: '',
            role: userRole,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setUser(tempUser);
          localStorage.setItem("currentUser", JSON.stringify(tempUser));
          
          // Show different message for admin vs regular users
          if (isAdmin) {
            toast({
              title: "Admin access granted",
              description: "Your profile is incomplete. Please create a full profile in User Management.",
              variant: "default"
            });
            
            // For admins, automatically create their profile in the database
            try {
              const { error: insertError } = await supabase
                .from('app_users')
                .insert({
                  id: userId,
                  name: tempUser.name,
                  email: tempUser.email,
                  mobile: '',
                  role: 'super_admin',
                  is_active: true
                });
                
              if (insertError) {
                console.error("Error creating admin user profile:", insertError);
              } else {
                console.log("Created admin profile in database");
              }
            } catch (err) {
              console.error("Failed to create admin profile:", err);
            }
          } else {
            toast({
              title: "Limited Access",
              description: "Your user profile is incomplete. Please contact an administrator.",
              variant: "default"
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
    try {
      console.log('Attempting login for:', email);
      setIsLoading(true);
      
      // Try to authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (authData.user) {
        console.log('Auth successful, user ID:', authData.user.id);
        // Navigation will happen after user profile is fetched via the onAuthStateChange handler
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      throw error;
    } finally {
      // Reset loading state if we need to
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    hasRole,
    login,
    logout,
    updateUser
  };
};
