"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="font-['Quicksand',sans-serif]">
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#606C38]/10 text-[#606C38] font-bold"
                      : "text-gray-700 hover:bg-gray-100/70 hover:text-gray-900"
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

