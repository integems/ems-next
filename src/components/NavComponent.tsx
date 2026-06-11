"use client";
import UserMenu from "@/components/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Moon, Sun, Home, Sparkles, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Logo } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

const navigationLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ai-chatbot", label: "AI Assistant", icon: Sparkles },
];

export default function NavComponent() {
  const { currentUser, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSignOut = () => {
    setMenuOpen(false);
    signOut().then(() => window.location.reload());
  };

  const allLinks = [
    ...navigationLinks,
    ...(currentUser.isAuthenticated ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pt-3 sm:pt-4">
        <nav
          className={cn(
            "w-full max-w-5xl flex h-12 sm:h-14 items-center justify-between gap-2 sm:gap-4 rounded-full px-3 sm:px-5 transition-all duration-300",
            "bg-white/5 backdrop-blur-sm shadow-lg",
          )}
        >
          {/* Left: Logo + Desktop Links */}
          <div className="flex items-center gap-6">
            <Logo />

            {/* Desktop nav links — hidden on mobile */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-1">
                {navigationLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        href={link.href}
                        className="relative flex flex-row items-center gap-1.5 px-3 py-1.5 text-base font-bold text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                      >
                        <Icon className="w-4 h-4 text-current" />
                        <span>{link.label}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
                {currentUser.isAuthenticated && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/dashboard"
                      className="relative px-3 py-1.5 text-base font-bold text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
                    >
                      Dashboard
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Desktop-only controls + hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop: sign in button */}
            {!currentUser.isAuthenticated && (
              <Button
                asChild
                size="sm"
                className="rounded-full px-5 text-sm font-semibold shadow-sm transition-all hover:shadow-md max-md:hidden"
              >
                <Link href="/signin">Sign in</Link>
              </Button>
            )}

            {/* Desktop separators + controls */}
            <div className="max-md:hidden flex items-center gap-2">
              <div className="w-px h-4 bg-border mx-1" />
              <ThemeToggle />
              {currentUser.isAuthenticated && (
                <>
                  <div className="w-px h-4 bg-border mx-1" />
                  <UserMenu />
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={cn(
                "md:hidden relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none",
                menuOpen ? "text-primary" : "text-foreground/80 hover:text-foreground",
              )}
            >
              <div className="relative w-5 h-3.5">
                <span
                  className={cn(
                    "absolute h-[2px] bg-current rounded-full transition-all duration-300 right-0 origin-center",
                    menuOpen 
                      ? "top-[6px] w-5 rotate-45" 
                      : "top-0 w-3"
                  )}
                />
                <span
                  className={cn(
                    "absolute h-[2px] bg-current rounded-full transition-all duration-300 right-0 origin-center",
                    menuOpen 
                      ? "top-[6px] w-0 opacity-0" 
                      : "top-[6px] w-5"
                  )}
                />
                <span
                  className={cn(
                    "absolute h-[2px] bg-current rounded-full transition-all duration-300 right-0 origin-center",
                    menuOpen 
                      ? "top-[6px] w-5 -rotate-45" 
                      : "bottom-0 w-4"
                  )}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Slide-down drawer */}
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                "fixed left-3 right-3 top-[calc(3rem+0.75rem)] z-50 md:hidden",
                "rounded-2xl overflow-hidden",
                // Glassmorphism with solid theme background for maximum text visibility
                "bg-background/92 dark:bg-background/95",
                "backdrop-blur-2xl saturate-150",
                "border border-border/40 dark:border-border/25",
                "shadow-2xl shadow-black/15 dark:shadow-black/40",
                // inner top highlight
                "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
              )}
            >
              {/* ── User profile row (authenticated only) ── */}
              {currentUser.isAuthenticated && (
                <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 dark:bg-muted/10">
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/20">
                    <AvatarImage src={currentUser.image} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {currentUser.fullName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {currentUser.fullName || "User"}
                    </p>
                    <p className="text-xs text-foreground/75 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Nav links ── */}
              <nav className={cn(
                "flex flex-col px-3 gap-1",
                currentUser.isAuthenticated ? "pt-3 pb-2" : "pt-4 pb-2"
              )}>
                {allLinks.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200",
                          pathname === link.href
                            ? "bg-primary/15 text-primary shadow-sm"
                            : "text-foreground hover:bg-foreground/5 hover:text-foreground",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* ── Theme toggle row ── */}
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-bold text-foreground/80">
                  Appearance
                </span>
                <button
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border border-border/30",
                    "bg-foreground/5 hover:bg-foreground/10 text-foreground",
                  )}
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <Moon className="h-4 w-4 text-primary" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 text-primary" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── Auth action ── */}
              <div className="px-5 pb-5 pt-2">
                {currentUser.isAuthenticated ? (
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 border border-border/30 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                ) : (
                  <Button
                    asChild
                    className="w-full rounded-xl font-bold py-6 text-base shadow-sm hover:shadow"
                  >
                    <Link href="/signin" onClick={() => setMenuOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
