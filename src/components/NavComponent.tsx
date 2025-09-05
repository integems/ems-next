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

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ai-chatbox", label: "AI Chatbox" },
];

export default function NavComponent() {
  const { currentUser } = useAuth();
  return (
    <header className="fixed top-0 bg-primary p-3 w-full">
      <div className="flex h-16 items-center justify-between mx-auto gap-4 w-full md:px-20">
        <div className="flex items-center gap-2">
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-primary hover:text-primary/90">
              <HomeIcon className="text-primary-foreground" />
            </Link>
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      href={link.href}
                      className=" py-1.5 font-semibold text-primary-foreground hover:bg-transparent hover:border-b-2 transition-all"
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
          {currentUser.isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
