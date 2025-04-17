
import React from "react";
import { User, UserRole } from "@/types/auth";
import { roleNames } from "@/utils/rbac/rolePermissions";
import { format } from "date-fns";
import { 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  AlertTriangle,
  CheckCircle2, 
  User as UserIcon,
  Shield,
  Loader2
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleActive: (userId: string, currentStatus: boolean) => void;
  currentUser: User | null;
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onToggleActive,
  currentUser,
  isLoading = false
}) => {
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "sales":
        return "default";
      case "service":
        return "secondary";
      case "finance":
        return "success";
      case "inventory":
        return "warning";
      case "engineer":
        return "outline";
      case "read_only":
        return "secondary";
      default:
        return "default";
    }
  };
  
  const isSelf = (userId: string) => {
    return currentUser?.id === userId;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 border rounded-md">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                No users found. Try adjusting your search or add a new user.
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {user.name}
                  {isSelf(user.id) && (
                    <Badge variant="outline" className="ml-2">You</Badge>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant={getRoleBadgeVariant(user.role)}
                          className="flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          {roleNames[user.role]}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {user.role === "super_admin" 
                            ? "Has full system access" 
                            : `Limited access based on ${roleNames[user.role]} role`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{user.branch || "-"}</TableCell>
                <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onToggleActive(user.id, user.isActive)}
                            disabled={isSelf(user.id)}
                          >
                            {user.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {user.isActive ? "Deactivate" : "Activate"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isSelf(user.id) 
                            ? "You cannot change your own status" 
                            : user.isActive 
                              ? "Set as inactive" 
                              : "Set as active"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
