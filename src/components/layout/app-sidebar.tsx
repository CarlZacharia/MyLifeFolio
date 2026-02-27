"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Shield,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Folio", href: "/folio", icon: FolderOpen },
  { title: "People & Roles", href: "/people", icon: Users },
  { title: "Access Control", href: "/access", icon: Shield },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/MLFIconOnly.png"
            alt="MyLifeFolio icon"
            width={28}
            height={28}
          />
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold uppercase tracking-widest text-sidebar-primary">
              My Life
            </span>
            <span className="font-serif text-lg italic text-gold">
              folio
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex flex-1 items-center gap-3 rounded-md p-1 hover:bg-sidebar-accent"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserCircle className="size-5" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {profile?.preferred_name || profile?.full_name || "User"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {profile?.email}
              </p>
            </div>
          </Link>
          <button
            onClick={signOut}
            title="Sign out"
            className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
