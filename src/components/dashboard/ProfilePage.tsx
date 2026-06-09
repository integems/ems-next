"use client";

import UpdateUserForm from "@/components/dashboard/users/UpdateUserForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  LoaderIcon,
  Mail,
  PenLine,
  Phone,
  Shield,
  Activity
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: userResponse,
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
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  // Handle nested data if API wraps it
  const user: any = userResponse;

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
        <Activity className="h-10 w-10 text-destructive mb-4" />
        <p className="text-lg">Couldn't connect and load your profile.</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="mt-4 border-border text-foreground hover:bg-accent"
        >
          Retry
        </Button>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account settings and preferences seamlessly.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all hover:shadow-md">
              <PenLine className="h-4 w-4" /> Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Profile</DialogTitle>
            </DialogHeader>
            <UpdateUserForm
              user={user}
              onClose={() => {
                setIsDialogOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Main Identity */}
        <Card className="lg:col-span-1 overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="h-32 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/30 relative">
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
          </div>
          <CardContent className="relative px-6 pb-8 pt-0 sm:px-8">
            <div className="-mt-16 mb-5 flex justify-center">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg transition-transform hover:scale-105 duration-300">
                <AvatarImage src={user.profileImage || ""} alt={user.fullName || ""} className="object-cover" />
                <AvatarFallback className="text-4xl font-semibold bg-primary/10 text-primary">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium text-sm">
                <Shield className="h-4 w-4 text-primary" />
                {user.userRole?.role?.roleName || "User"}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-4 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {user.status || "Active"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <h3 className="text-lg font-semibold text-foreground">Personal Details</h3>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
              <div className="space-y-1.5 group">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <Mail className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Email Address
                </p>
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {user.email || "—"}
                </p>
              </div>
              <div className="space-y-1.5 group">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Phone Number
                </p>
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {user.phoneNumber || <span className="text-muted-foreground italic">Not provided</span>}
                </p>
              </div>
              <div className="space-y-1.5 group">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <CalendarDays className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Member Since
                </p>
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {user.createdAt ? format(new Date(user.createdAt), "MMMM dd, yyyy") : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
