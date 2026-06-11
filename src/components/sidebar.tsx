"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  ChevronRight,
  Cloud,
  Droplet,
  Flower,
  Home,
  Leaf,
  LogOut,
  Settings2,
  Sparkles,
  Trash2,
  User,
  Users,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

// Define NavLink interface for type safety
import { RoleName } from "@/types/common.types";
import { useAuth } from "@/hooks/use-auth";

interface NavLink {
  href?: string;
  label: string;
  icon?: React.ElementType;
  type: "link" | "submenu";
  children?: NavLink[];
  roles?: RoleName[];
}

// Sidebar navigation links
const sidebarLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, type: "link" },
  { href: "/dashboard/profile", label: "Profile", icon: User, type: "link" },
  {
    label: "Air",
    icon: Cloud,
    type: "submenu",
    children: [
      {
        href: "/dashboard/air",
        label: "Management",
        icon: Settings2,
        type: "link",
      },
      {
        href: "/dashboard/air/analysis",
        label: "Analysis",
        icon: BarChart2,
        type: "link",
      },
    ],
  },
  {
    label: "Water",
    icon: Droplet,
    type: "submenu",
    children: [
      {
        href: "/dashboard/water",
        label: "Management",
        icon: Settings2,
        type: "link",
      },
      {
        href: "/dashboard/water/analysis",
        label: "Analysis",
        icon: BarChart2,
        type: "link",
      },
    ],
  },
  {
    label: "Soil",
    icon: Leaf,
    type: "submenu",
    children: [
      {
        href: "/dashboard/soil",
        label: "Management",
        icon: Settings2,
        type: "link",
      },
      {
        href: "/dashboard/soil/analysis",
        label: "Analysis",
        icon: BarChart2,
        type: "link",
      },
    ],
  },
  {
    label: "Noise",
    icon: Volume2,
    type: "submenu",
    children: [
      {
        href: "/dashboard/noise",
        label: "Management",
        icon: Settings2,
        type: "link",
      },
      {
        href: "/dashboard/noise/analysis",
        label: "Analysis",
        icon: BarChart2,
        type: "link",
      },
    ],
  },
  {
    label: "Biodiversity",
    icon: Flower,
    type: "submenu",
    children: [
      {
        href: "/dashboard/biodiversity",
        label: "Management",
        icon: Settings2,
        type: "link",
      },
      {
        href: "/dashboard/biodiversity/analysis",
        label: "Analysis",
        icon: BarChart2,
        type: "link",
      },
    ],
  },
  {
    label: "Waste",
    icon: Trash2,
    type: "submenu",
    children: [
      {
        href: "/dashboard/waste",
        label: "Management",
        icon: Settings2,
        type: "link",
      },
      {
        href: "/dashboard/waste/analysis",
        label: "Analysis",
        icon: BarChart2,
        type: "link",
      },
    ],
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
    type: "link",
    roles: [RoleName.SuperAdmin],
  },
  {
    label: "AI Assistant",
    icon: Sparkles,
    href: "/dashboard/ai-chat-analysis",
    type: "link",
  },
];

// Component for rendering individual sidebar links or submenus
function SidebarLink({ link, level = 0 }: { link: NavLink; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (link.type === "link" && link.href) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              pathname === link.href
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-primary",
              level > 0 && "pl-8",
            )}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.icon && <link.icon className="h-4 w-4" aria-hidden="true" />}
            <span>{link.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (link.type === "submenu") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all",
            "text-muted-foreground hover:bg-muted hover:text-primary",
            level > 0 && "pl-8",
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`submenu-${link.label}`}
        >
          <div className="flex items-center gap-3">
            {link.icon && <link.icon className="h-4 w-4" aria-hidden="true" />}
            <span>{link.label}</span>
          </div>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-90",
            )}
            aria-hidden="true"
          />
        </SidebarMenuButton>
        {isOpen && (
          <SidebarMenu id={`submenu-${link.label}`} className="grid gap-1 pl-4">
            {link.children?.map((childLink, index) => (
              <SidebarLink key={index} link={childLink} level={level + 1} />
            ))}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    );
  }

  return null;
}

// Component for rendering sidebar content
function SidebarContentUI({ className }: { className?: string }) {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role as RoleName;

  const filteredLinks = sidebarLinks.filter((link) => {
    if (!link.roles) return true;
    return link.roles.includes(userRole);
  });

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className={cn("text-sm font-medium", className)}>
            {filteredLinks.map((link, index) => (
              <SidebarLink key={index} link={link} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// Logout action pinned to the sidebar footer
function SidebarLogout() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/signin");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Main AppSidebar component
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-black text-3xl">
      <Image src="/logo.png" alt="INTEGEMS Logo" width={40} height={40} className="object-contain" />
      <span className="text-[#1a7c1a] dark:text-[#1a7c1a]">EMS</span>
    </Link>
  );
}

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" className="w-64">
      <SidebarHeader>
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContentUI />
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
