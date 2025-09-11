"use client";
import UserMenu from "@/components/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { HomeIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import { Logo } from "./sidebar";

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ai-chatbox", label: "AI Chatbox" },
];

export default function NavComponent() {
  const { currentUser } = useAuth();
  return (
    <header className="fixed top-0 p-3 w-full">
      <div className="flex h-16 items-center justify-between mx-auto gap-4 w-full md:px-20">
        <div className="flex items-center gap-2">
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Logo />
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className=" py-1.5 font-semibold hover:opacity-50 hover:border-b-2 transition-all"
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        {/* Right side */}
        <div className="flex flex-row items-center gap-4">
          {!currentUser.isAuthenticated && (
            <Button asChild size="sm">
              <Link href={"/signin"}></Link>
            </Button>
          )}
          <ThemeToggle />
          {currentUser.isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
