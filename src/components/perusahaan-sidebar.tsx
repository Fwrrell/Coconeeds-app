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
  Handshake,
  Truck,
  QrCode,
  User,
  HelpCircle,
  Building2,
} from "lucide-react";

// sidebar perusahaan mirror 1:1 dr app-sidebar
const navMainData = [
  {
    title: "Dashboard B2B",
    url: "/perusahaan",
    icon: <LayoutDashboard className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Negosiasi Harga",
    url: "/perusahaan/negosiasi",
    icon: <Handshake className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "Tracking Logistik",
    url: "/perusahaan/pengiriman",
    icon: <Truck className="h-4 w-4 text-[#606C38]" />,
  },
  {
    title: "ESG Traceability",
    url: "/perusahaan/traceability",
    icon: <QrCode className="h-4 w-4 text-[#606C38]" />,
  },
];

const navSecondaryData = [
  {
    title: "Profil Perusahaan",
    url: "/perusahaan/profil",
    icon: <User className="h-4 w-4 text-gray-500" />,
  },
  {
    title: "Bantuan & CS",
    url: "#",
    icon: <HelpCircle className="h-4 w-4 text-gray-500" />,
  },
];

interface PerusahaanSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function PerusahaanSidebar({ user, ...props }: PerusahaanSidebarProps) {
  const userData = {
    name: user?.name || "Mitra Perusahaan B2B",
    email: user?.email || "mitra@perusahaan.com",
    avatar: user?.image || "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="p-1.5 hover:bg-gray-100/60 rounded-md transition-colors"
              render={<a href="/perusahaan" />}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#606C38] text-white shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-bold text-gray-900 leading-tight">
                  Coconeeds
                </span>
                <span className="text-[10px] font-semibold text-[#606C38] uppercase tracking-wider">
                  Portal Perusahaan B2B
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
