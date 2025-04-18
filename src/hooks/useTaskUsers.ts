
import { useState, useEffect } from "react";
import { User, TaskDepartment } from "@/types/task";
import { userService } from "@/services/userService";

export const useTaskUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    try {
      const allUsers = await userService.getUsers();
      console.log("TaskContext - Fetched users:", allUsers);
      
      const mappedUsers: User[] = allUsers.map(authUser => ({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        department: (authUser.role === 'sales' ? 'Sales' : 
                    authUser.role === 'service' ? 'Service' : 
                    authUser.role === 'inventory' ? 'Inventory' : 
                    authUser.role === 'finance' ? 'Admin' : 'Admin') as TaskDepartment,
      }));
      
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      
      if (err instanceof Error) {
        throw err;
      }
    }
  };

  return {
    users,
    loadUsers
  };
};
