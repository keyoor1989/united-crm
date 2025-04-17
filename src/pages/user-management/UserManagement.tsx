
import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Search, 
  Plus, 
  Shield 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userService, UserCreate } from "@/services/userService";
import { useToast } from "@/components/ui/use-toast";
import UserFormDialog from "./UserFormDialog";
import UserTable from "./UserTable";
import UserRolesInfo from "./UserRolesInfo";
import { supabase } from "@/integrations/supabase/client";

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRolesInfo, setShowRolesInfo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    
    // Enable realtime updates for the app_users table
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
          console.log('User data changed:', payload);
          fetchUsers(); // Refresh users when data changes
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getUsers();
      console.log('Fetched users:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error instanceof Error ? error.message : "There was a problem loading the user list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile.includes(searchTerm)
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleUserSave = async (userData: UserCreate) => {
    try {
      if (editingUser) {
        await userService.updateUser(userData.id!, userData);
        toast({
          title: "User updated",
          description: "User has been successfully updated.",
        });
      } else {
        await userService.createUser(userData);
        toast({
          title: "User created",
          description: "New user has been successfully created.",
        });
      }
      
      fetchUsers();
      handleFormClose();
      
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        variant: "destructive",
        title: "Error saving user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.toggleUserActive(userId, !currentStatus);
      toast({
        title: "User status updated",
        description: `User is now ${!currentStatus ? "active" : "inactive"}.`,
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        variant: "destructive",
        title: "Error updating user status",
        description: "There was a problem updating the user status.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and access permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowRolesInfo(!showRolesInfo)}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {showRolesInfo ? "Hide" : "View"} Role Info
          </Button>
          
          <Button 
            onClick={handleAddUser}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {showRolesInfo && <UserRolesInfo />}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, or mobile..."
          className="pl-8"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <UserTable 
        users={filteredUsers} 
        onEdit={handleEditUser} 
        onToggleActive={handleToggleActive}
        currentUser={currentUser}
        isLoading={isLoading}
      />

      {isFormOpen && (
        <UserFormDialog
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={handleUserSave}
          user={editingUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
