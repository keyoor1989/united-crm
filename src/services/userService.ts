
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

export interface UserCreate extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export const userService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
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
      role: user.role,
      branch: user.branch,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  },
  
  /**
   * Create a new user
   */
  async createUser(user: UserCreate): Promise<User> {
    const { data, error } = await supabase
      .from('app_users')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        branch: user.branch,
        is_active: user.isActive
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      role: data.role,
      branch: data.branch,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
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
      role: data.role,
      branch: data.branch,
      isActive: data.is_active,
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
