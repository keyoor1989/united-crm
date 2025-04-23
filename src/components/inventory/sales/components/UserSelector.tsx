
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserSelectorProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ value, onValueChange }) => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['app_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, name')
        .eq('is_active', true);
        
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return data;
    }
  });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select sales person" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading">Loading users...</SelectItem>
        ) : users && users.length > 0 ? (
          users.map(user => (
            <SelectItem key={user.id} value={user.id || "no-id"}>
              {user.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-users">No users found</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};
