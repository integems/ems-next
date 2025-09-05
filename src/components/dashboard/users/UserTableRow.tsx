"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, UserStatus, RoleName } from "@/types/common.types";
import { AssignRoleDto } from "@/dtos/user.dto";
import { FrontendUserService } from "@/frontend-services/user.service";
import { useAuth } from "@/hooks/use-auth";
import {
  MoreHorizontal,
  Loader2,
  Pencil,
  UserCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserTableRowProps {
  user: User;
  roles: { roleId: string; roleName: RoleName }[];
  onEdit: (user: User) => void;
}

const userService = new FrontendUserService();

export default function UserTableRow({
  user,
  roles,
  onEdit,
}: UserTableRowProps) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isAssignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      await userService.deleteUser(currentUser.token, userId);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete user");
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: (assignRoleDto: AssignRoleDto) => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      return userService.assignRoleToUser(
        currentUser.token,
        user.userId,
        assignRoleDto,
      );
    },
    onSuccess: () => {
      toast.success("Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAssignRoleDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to assign role");
    },
  });

  const handleDeleteUser = () => {
    deleteUserMutation.mutate(user.userId);
  };

  const handleAssignRole = () => {
    if (selectedRoleId) {
      assignRoleMutation.mutate({ roleId: selectedRoleId });
    }
  };

  return (
    <>
      <TableRow className="hover:bg-accent/50">
        <TableCell>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage || ""} alt={user.fullName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell className="font-medium text-foreground">
          {user.fullName}
        </TableCell>
        <TableCell className="lowercase text-muted-foreground">
          {user.email}
        </TableCell>
        <TableCell>
          <Badge
            className={cn(
              "font-medium",
              user.status === UserStatus.Banned && "bg-red-500 text-white",
              user.status === UserStatus.Suspended &&
                "bg-yellow-500 text-black",
              user.status === UserStatus.Active && "bg-green-500 text-white",
            )}
          >
            {user.status}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {user.userRole?.role?.roleName || "N/A"}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background border-border"
            >
              <DropdownMenuLabel className="text-foreground">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="text-foreground hover:bg-accent"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setAssignRoleDialogOpen(true)}
                className="text-foreground hover:bg-accent"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Assign Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive hover:bg-destructive/10"
                onClick={handleDeleteUser}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <Dialog
        open={isAssignRoleDialogOpen}
        onOpenChange={setAssignRoleDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Role to {user.fullName}</DialogTitle>
            <DialogDescription>
              Select a role to assign to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setAssignRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAssignRole}
              disabled={assignRoleMutation.isPending || !selectedRoleId}
            >
              {assignRoleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
