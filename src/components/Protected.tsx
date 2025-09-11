"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoaderIcon } from "lucide-react";

interface ProtectedProps {
  children: React.ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const { currentUser } = useAuth();
  const router = useRouter();

  console.log({ currentUser });

  useEffect(() => {
    if (currentUser && !currentUser.isAuthenticated) {
      //   router.push('/signin');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <LoaderIcon className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
