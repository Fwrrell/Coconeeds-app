"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Store,
  Boxes,
  Truck,
  ShoppingCart,
  Settings2,
  HelpCircle,
  Sprout,
} from "lucide-react";

const navMainData = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: <LayoutDashboard className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Manajemen Pengguna",
    url: "/admin/users",
    icon: <Users className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Manajemen Kopdes",
    url: "/admin/kopdes",
    icon: <Store className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Manajemen Inventaris",
    url: "/admin/inventory",
    icon: <Boxes className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Manajemen Logistik",
    url: "/admin/logistics",
    icon: <Truck className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Marketplace B2B",
    url: "/admin/marketplace",
    icon: <ShoppingCart className="h-4 w-4 text-[#606C38]" />,
  },
];

const navSecondaryData = [
  {
    title: "Pengaturan",
    url: "/admin/settings",
    icon: <Settings2 className="h-4 w-4 text-gray-500" />,
  },
  {
    title: "Bantuan & Layanan",
    url: "#",
    icon: <HelpCircle className="h-4 w-4 text-gray-500" />,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = {
    name: user?.name || "Admin Coconeeds",
    email: user?.email || "admin@Coconeeds.id",
    avatar: user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="p-1.5 hover:bg-gray-100/60 rounded-md transition-colors"
              render={<a href="/admin" />}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#606C38] text-white shrink-0">
                <Sprout className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-bold text-gray-900 leading-tight">
                  Coconeeds
                </span>
                <span className="text-[10px] font-semibold text-[#606C38] uppercase tracking-wider">
                  Admin Platform
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <NavMain items={navMainData} />
        <NavSecondary
          items={navSecondaryData}
          className="mt-auto pt-4 border-t border-gray-100"
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
