"use client";
import UserMenu from "@/components/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/ai-chatbot", label: "AI Chatbot" },
];

export default function NavComponent() {
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          "w-full max-w-5xl flex h-14 items-center justify-between gap-4 rounded-full px-5 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border border-border shadow-sm shadow-black/5 dark:shadow-black/20"
            : "bg-background/40 backdrop-blur-md border border-white/10 dark:border-white/5",
        )}
      >
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-6">
          <Logo />

          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList className="gap-1">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    href={link.href}
                    className="relative px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {currentUser.isAuthenticated && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/dashboard"
                    className="relative px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                  >
                    Dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {!currentUser.isAuthenticated && (
            <Button
              asChild
              size="sm"
              className="rounded-full px-5 text-sm font-semibold shadow-sm transition-all hover:shadow-md"
            >
              <Link href="/signin">Sign in</Link>
            </Button>
          )}

          <div className="w-px h-4 bg-border mx-1 max-md:hidden" />

          <ThemeToggle />

          {currentUser.isAuthenticated && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              <UserMenu />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
