"use client";

import UpdateUserForm from "@/components/dashboard/users/UpdateUserForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { frontendUserService } from "@/frontend-services/user.service";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user-profile", currentUser?.userId],
    queryFn: async () => {
      if (!currentUser?.token || !currentUser.userId) {
        throw new Error("User not authenticated");
      }
      return frontendUserService.fetchUserById(
        currentUser.token,
        currentUser.userId,
      );
    },
    enabled: !!currentUser?.token && !!currentUser?.userId,
  });

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <p>Couldn't connect. Try again</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="mt-2 border-border text-foreground hover:bg-accent"
        >
          Retry
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20 text-3xl">
            <AvatarFallback className="text-3xl font-semibold">
              {getInitials(user.firstName || "User")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {user.firstName} {user.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Role</h3>
            <p className="text-muted-foreground">
              {user.userRole?.role?.roleName}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className="text-muted-foreground">{user.status}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <UpdateUserForm
                user={user}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
