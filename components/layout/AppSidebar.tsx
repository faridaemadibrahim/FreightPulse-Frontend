"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Anchor,
  Truck,
  Route,
  Bell,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Rates", href: "/rates", icon: TrendingUp },
  { title: "Ports", href: "/ports", icon: Anchor },
  { title: "Carriers", href: "/carriers", icon: Truck },
  { title: "Route Brief", href: "/route-brief", icon: Route },
  { title: "Alerts", href: "/alerts", icon: Bell },
];

// "/" would prefix-match every route, so it only counts as active on an exact
// match. The rest stay active on their sub-routes too, e.g. /rates/Shanghai-Europe
// keeps "Rates" highlighted.
function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="h-auto justify-center px-4 py-4 group-data-[collapsible=icon]:hidden">
        <Link
          href="/"
          aria-label="FreightPulse dashboard"
          className="flex w-fit items-center gap-1.5 text-[18px] font-bold tracking-tight text-[#111827]"
        >
          <Image
            src="/images/freightpulse-mark.svg"
            alt=""
            width={42}
            height={30}
            priority
            className="h-[18px] w-[56px] object-contain"
          />
          FreightPulse
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isCurrent(pathname, item.href);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      // Colour alone shouldn't be the only cue, and it also
                      // tells a screen reader which page it is on.
                      aria-current={active ? "page" : undefined}
                      render={<Link href={item.href} />}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
