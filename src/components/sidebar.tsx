"use client";

import {
  Sidebar,
  SidebarContent,
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
  Bot,
  ChevronRight,
  Cloud,
  Droplet,
  Flower,
  Home,
  Leaf,
  Settings,
  Settings2,
  Trash2,
  User,
  Users,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

// Define NavLink interface for type safety
interface NavLink {
  href?: string;
  label: string;
  icon?: React.ElementType;
  type: "link" | "submenu";
  children?: NavLink[];
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
  },
  {
    label: "AI Analysis",
    icon: Bot,
    href: "/dashboard/ai-chat-analysis",
    type: "link",
  },

  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
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
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className={cn("text-sm font-medium", className)}>
            {sidebarLinks.map((link, index) => (
              <SidebarLink key={index} link={link} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// Main AppSidebar component
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1 font-black text-3xl">
      <span className="text-primary">E</span>
      <span className="text-primary">M</span>
      <span className="text-primary">S</span>
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
    </Sidebar>
  );
}
