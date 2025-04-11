
import React, { useState } from "react";
import { 
  User as UserIcon, 
  Search, 
  Plus, 
  Check, 
  X, 
  Edit, 
  Shield 
} from "lucide-react";
import { mockUsers, useAuth } from "@/contexts/AuthContext";
import { User, UserRole } from "@/types/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { roleNames } from "@/utils/rbac/rolePermissions";
import UserFormDialog from "./UserFormDialog";
import UserTable from "./UserTable";
import UserRolesInfo from "./UserRolesInfo";

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showRolesInfo, setShowRolesInfo] = useState(false);

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

  const handleUserSave = (userData: Partial<User> & { id: string }) => {
    setUsers(prevUsers => {
      const userIndex = prevUsers.findIndex(u => u.id === userData.id);
      
      if (userIndex >= 0) {
        // Update existing user
        const updatedUsers = [...prevUsers];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };
        return updatedUsers;
      } else {
        // Add new user
        const newUser: User = {
          id: userData.id,
          name: userData.name || "",
          email: userData.email || "",
          mobile: userData.mobile || "",
          role: userData.role || "read_only",
          branch: userData.branch,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [...prevUsers, newUser];
      }
    });
    
    handleFormClose();
  };

  const handleToggleActive = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId 
          ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() } 
          : u
      )
    );
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
