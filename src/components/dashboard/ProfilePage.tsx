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
    <div className="w-full animate-in fade-in duration-500">
      {/* Profile Header Hero Section */}
      <div className="relative rounded-xl bg-gradient-to-r from-primary via-primary/90 to-emerald-950 px-6 py-16 sm:px-8 sm:py-20 text-white shadow-inner">
        {/* Background designs (clipped to the hero, kept separate so the avatar can overflow) */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary/30 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {/* Profile Avatar Container */}
            <div className="relative -mb-28 z-20 md:pb-2">
              <Avatar className="h-36 w-36 border-4 border-background shadow-2xl transition-transform hover:scale-105 duration-300">
                <AvatarImage src={user.profileImage || ""} alt={user.fullName || ""} className="object-cover" />
                <AvatarFallback className="text-4xl font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Identity details */}
            <div className="space-y-2 md:pb-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {user.status || "Active"}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90 text-sm font-medium">
                <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  {user.userRole?.role?.roleName || "User"}
                </span>
                <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  {user.email || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Action button inside hero */}
          <div className="md:pb-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all font-semibold px-6 py-5 rounded-xl text-sm border-none">
                  <PenLine className="h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Stats Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
              <CardHeader className="bg-muted/40 pb-4 border-b border-border/50">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account Status</h3>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <span className="text-sm text-muted-foreground font-medium">Role Privilege</span>
                  <span className="text-sm font-semibold text-foreground px-2 py-0.5 bg-muted rounded-md">{user.userRole?.role?.roleName || "User"}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <span className="text-sm text-muted-foreground font-medium">Verification Status</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Registration Date</span>
                  <span className="text-sm font-semibold text-foreground">
                    {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
              <CardHeader className="bg-muted/40 pb-4 border-b border-border/50">
                <h3 className="text-lg font-bold text-foreground">Personal Details</h3>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
                <div className="space-y-1.5 group">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                    <Mail className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Email Address
                  </p>
                  <p className="font-semibold text-foreground text-sm sm:text-base bg-muted/30 px-3 py-2 rounded-xl border border-border/30">
                    {user.email || "—"}
                  </p>
                </div>
                
                <div className="space-y-1.5 group">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                    <Phone className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Phone Number
                  </p>
                  <p className="font-semibold text-foreground text-sm sm:text-base bg-muted/30 px-3 py-2 rounded-xl border border-border/30">
                    {user.phoneNumber || <span className="text-muted-foreground font-normal italic">Not provided</span>}
                  </p>
                </div>
                
                <div className="space-y-1.5 group">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                    <CalendarDays className="h-3.5 w-3.5 group-hover:text-primary transition-colors" /> Member Since
                  </p>
                  <p className="font-semibold text-foreground text-sm sm:text-base bg-muted/30 px-3 py-2 rounded-xl border border-border/30">
                    {user.createdAt ? format(new Date(user.createdAt), "MMMM dd, yyyy") : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
