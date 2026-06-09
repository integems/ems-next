"use client";

import { ExportButton } from "@/components/ExportButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserFilterDto } from "@/dtos/user.dto";
import { RoleService } from "@/frontend-services/role.service";
import { FrontendUserService } from "@/frontend-services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { RoleName, User, UserStatus } from "@/types/common.types";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon, Search, UserPlus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import CreateUserForm from "./CreateUserForm";
import UpdateUserForm from "./UpdateUserForm";
import UserTableRow from "./UserTableRow";

const userService = new FrontendUserService();
const roleService = new RoleService();

const userDataColumns = [
  { header: "Full Name", accessor: "fullName" },
  { header: "Email", accessor: "email" },
  { header: "Status", accessor: "status" },
  { header: "Role", accessor: "role" },
  { header: "Created At", accessor: "createdAt" },
  { header: "Updated At", accessor: "updatedAt" },
];

export default function UsersManagementPage() {
  const { currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleName>(RoleName.All);
  const [activeRoleFilter, setActiveRoleFilter] = useState<RoleName>(
    RoleName.All,
  );
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<UserStatus | "">(
    "",
  );
  const [roles, setRoles] = useState<{ roleId: string; roleName: RoleName }[]>(
    [],
  );
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const limit = 10;

  const {
    data: usersDataResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "users",
      page,
      activeSearchQuery,
      activeRoleFilter,
      activeStatusFilter,
      currentUser?.token,
    ],
    queryFn: async () => {
      if (!currentUser?.token) {
        throw new Error("User not authenticated");
      }
      const filters: UserFilterDto = {
        page,
        limit,
        search: activeSearchQuery,
        role: activeRoleFilter,
        status: activeStatusFilter || undefined,
      };
      const users = await userService.findAllUsers(currentUser.token, filters);
      return users;
    },
    enabled: !!currentUser?.token,
  });

  const users = usersDataResponse?.data ?? [];
  const metadata = usersDataResponse?.metadata || {
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
  };

  useEffect(() => {
    if (currentUser?.token) {
      roleService.getAllRoles(currentUser.token).then((fetchedRoles) => {
        setRoles(fetchedRoles);
      });
    }
  }, [currentUser?.token]);

  const handleApplyFilters = useCallback(() => {
    setPage(1);
    if (!searchQuery && roleFilter === RoleName.All && statusFilter === "") {
      setActiveSearchQuery("");
      setActiveRoleFilter("All" as RoleName);
      setActiveStatusFilter("All" as UserStatus);
      refetch();
      return;
    }
    setActiveSearchQuery(searchQuery || "");
    // console.log({ roleFilter });
    setActiveRoleFilter(roleFilter);
    setActiveStatusFilter(statusFilter);
    refetch();
  }, [searchQuery, roleFilter, statusFilter, refetch]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= metadata.totalPages) {
      setPage(newPage);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const { currentPage, totalPages } = metadata;
    const ellipsis = (
      <PaginationItem key="ellipsis">
        <PaginationEllipsis />
      </PaginationItem>
    );

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={() => handlePageChange(1)}
            isActive={1 === currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (currentPage > 3) {
        pages.push(React.cloneElement(ellipsis, { key: "start-ellipsis" }));
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        startPage = 2;
        endPage = 4;
      }
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
        endPage = totalPages - 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(i)}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (currentPage < totalPages - 2) {
        pages.push(React.cloneElement(ellipsis, { key: "end-ellipsis" }));
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={() => handlePageChange(totalPages)}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return pages;
  };

  const handleOpenCreateUserDialog = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleOpenEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  return (
    <div className="w-full rounded-2xl bg-card p-4 shadow-md shadow-black/5 sm:p-6 dark:shadow-black/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">User Overview</h2>
        <div className="flex gap-2">
          <ExportButton
            service={{ findAll: userService.findAllUsers }}
            filters={{
              search: activeSearchQuery,
              role: activeRoleFilter,
              status: activeStatusFilter || undefined,
            }}
            fileName="UsersData"
            token={currentUser?.token || ""}
            columns={userDataColumns}
          />
          {(currentUser?.role === RoleName.SuperAdmin ||
            currentUser?.role === RoleName.IntegemsAdmin ||
            currentUser?.role === RoleName.Admin) && (
            <Button
              size="icon"
              onClick={handleOpenCreateUserDialog}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mb-6 rounded-xl bg-card p-4">
        <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 w-full">
          <label
            htmlFor="role"
            className="block text-sm font-medium mb-1 text-foreground"
          >
            Filter by Role
          </label>
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as RoleName)}
          >
            <SelectTrigger id="role" className="bg-background border-border">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RoleName.All}>All</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.roleId} value={role.roleName}>
                  {role.roleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full">
          <label
            htmlFor="status"
            className="block text-sm font-medium mb-1 text-foreground"
          >
            Filter by Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as UserStatus | "")}
          >
            <SelectTrigger id="status" className="bg-background border-border">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UserStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
        <Button
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
          <p>Couldn't connect</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 border-border text-foreground hover:bg-accent"
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[60px] text-foreground font-semibold">
                    Avatar
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Full Name
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Role
                  </TableHead>
                  <TableHead className="w-[50px] text-foreground font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <UserTableRow
                      key={user.userId}
                      user={user}
                      roles={roles}
                      onEdit={handleOpenEditUserDialog}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing page {metadata.currentPage} of {metadata.totalPages} (
              {metadata.totalItems} users)
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(1)}
                    disabled={metadata.currentPage === 1}
                  >
                    First
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(metadata.currentPage - 1)}
                    className={cn(
                      "text-foreground hover:bg-accent",
                      metadata.currentPage === 1 &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(metadata.currentPage + 1)}
                    className={cn(
                      "text-foreground hover:bg-accent",
                      metadata.currentPage === metadata.totalPages &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(metadata.totalPages)}
                    disabled={metadata.currentPage === metadata.totalPages}
                  >
                    Last
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
      <Dialog open={isUserDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Update the user's details below."
                : "Fill in the form to create a new user."}
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <UpdateUserForm
              user={selectedUser}
              onClose={() => setUserDialogOpen(false)}
            />
          ) : (
            <CreateUserForm
              roles={roles}
              onClose={() => setUserDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
