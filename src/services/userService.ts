
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/auth";

export interface UserCreate extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  password?: string; // Add password field
}

// Define an interface for the create_app_user RPC parameters
interface CreateAppUserParams {
  user_id: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  user_role: string;
  user_branch: string; // Changed from optional to required to match RPC expectations
  user_is_active: boolean;
  user_has_set_password: boolean;
}

// More efficient approach to realtime subscriptions
export const subscribeToUserChanges = (callback: (user: User) => void) => {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_users'
      },
      (payload) => {
        console.log('User changes received:', payload);
        if (payload.new) {
          const userData = payload.new as any;
          const user: User = {
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
          callback(user);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const userService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    // Get the current session to see if the user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('User not authenticated');
      throw new Error('Authentication required to fetch users');
    }
    
    // Fetch users from app_users table
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    // Map database fields to User type
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role as UserRole, // Cast the role to UserRole
      branch: user.branch,
      isActive: user.is_active,
      hasSetPassword: user.has_set_password,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  },
  
  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      role: data.role as UserRole,
      branch: data.branch,
      isActive: data.is_active,
      hasSetPassword: data.has_set_password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  /**
   * Create a new user
   */
  async createUser(user: UserCreate): Promise<User> {
    try {
      // First check if a user with this email already exists
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (existingUser) {
        throw new Error(`A user with email ${user.email} already exists.`);
      }
      
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password || "TemporaryPass123!", // Use provided password or a default
        options: {
          data: {
            name: user.name,
            mobile: user.mobile,
            role: user.role,
            branch: user.branch
          }
        }
      });

      if (authError) {
        console.error('Error creating user in auth system:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user, no user data returned');
      }
      
      // Determine has_set_password value based on whether password was provided
      const hasSetPassword = !!user.password && user.password.length >= 8;
      
      // Create the app_user record using service role to bypass RLS
      const params: CreateAppUserParams = {
        user_id: authData.user.id,
        user_name: user.name,
        user_email: user.email,
        user_mobile: user.mobile,
        user_role: user.role,
        user_branch: user.branch || '', // Ensure branch is always a string, empty if not provided
        user_is_active: user.isActive,
        user_has_set_password: hasSetPassword
      };
      
      // Use proper type casting for the RPC call
      const { data: userData, error: userError } = await supabase.rpc(
        'create_app_user',
        params
      );
      
      if (userError) {
        // If there was an error creating the app_user, attempt to clean up the auth user
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to clean up auth user after app_user creation error:', cleanupError);
        }
        
        console.error('Error creating user in app_users:', userError);
        throw userError;
      }
      
      return {
        id: authData.user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role as UserRole,
        branch: user.branch,
        isActive: user.isActive,
        hasSetPassword: hasSetPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      // Handle specific database constraint errors
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`A user with email ${user.email} already exists.`);
      }
      throw error;
    }
  },
  
  /**
   * Update an existing user
   */
  async updateUser(id: string, updates: Partial<UserCreate>): Promise<User> {
    // Convert to snake case for database
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.branch !== undefined) dbUpdates.branch = updates.branch;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    
    const { data, error } = await supabase
      .from('app_users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      role: data.role as UserRole,
      branch: data.branch,
      isActive: data.is_active,
      hasSetPassword: data.has_set_password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  /**
   * Toggle user active status
   */
  async toggleUserActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('app_users')
      .update({ is_active: isActive })
      .eq('id', id);
    
    if (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }
};
