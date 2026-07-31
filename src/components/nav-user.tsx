"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { MoreVertical, User, CreditCard, Bell, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "AD";

  return (
    <SidebarMenu className="font-['Quicksand',sans-serif]">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="hover:bg-gray-100/70 rounded-md p-2 transition-colors flex items-center gap-3 w-full"
              >
                <Avatar className="h-8 w-8 rounded-md border border-gray-200 shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-[#606C38] text-white font-bold text-xs rounded-md">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                  <span className="truncate font-bold text-gray-900">{user.name}</span>
                  <span className="truncate text-[11px] font-medium text-gray-500">
                    {user.email}
                  </span>
                </div>
                <MoreVertical className="ml-auto h-4 w-4 text-gray-400 shrink-0" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="min-w-56 bg-white border border-gray-200 rounded-md shadow-none font-['Quicksand',sans-serif]"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left text-xs bg-gray-50/50 rounded-t-md border-b border-gray-100">
                  <Avatar className="h-8 w-8 rounded-md border border-gray-200">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-[#606C38] text-white font-bold text-xs rounded-md">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                    <span className="truncate font-bold text-gray-900">{user.name}</span>
                    <span className="truncate text-[11px] font-medium text-gray-500">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuGroup className="p-1 space-y-0.5">
              <DropdownMenuItem className="text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer rounded-sm">
                <User className="mr-2 h-3.5 w-3.5 text-gray-500" />
                Profil Akun
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer rounded-sm">
                <CreditCard className="mr-2 h-3.5 w-3.5 text-gray-500" />
                Manajemen Koperasi
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer rounded-sm">
                <Bell className="mr-2 h-3.5 w-3.5 text-gray-500" />
                Notifikasi System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-100" />
            <div className="p-1">
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer rounded-sm"
              >
                <LogOut className="mr-2 h-3.5 w-3.5 text-red-500" />
                Keluar (Log out)
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

