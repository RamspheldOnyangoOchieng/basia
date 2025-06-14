"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  CreditCard,
  Database,
  Image,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  FileText,
  DollarSign,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AdminSidebarContentProps {
  className?: string
}

export function AdminSidebarContent({ className }: AdminSidebarContentProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/characters",
      icon: MessageSquare,
      title: "Characters",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/users",
      icon: Users,
      title: "Users",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/api-keys",
      icon: FileText,
      title: "API Keys",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/image-suggestions",
      icon: Image,
      title: "Image Suggestions",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/banners",
      icon: BarChart,
      title: "Banners",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/subscriptions",
      icon: CreditCard,
      title: "Subscriptions",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/transactions",
      icon: DollarSign,
      title: "Transactions",
      variant: "ghost",
    },
    {
      href: "/admin/dashboard/database",
      icon: Database,
      title: "Database",
      variant: "ghost",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: "Settings",
      variant: "ghost",
    },
  ]

  return (
    <div className={cn("flex w-full flex-col gap-2 p-2", className)}>
      {routes.map((route) => (
        <Button
          key={route.href}
          variant={pathname === route.href ? "secondary" : "ghost"}
          className={cn("justify-start", pathname === route.href && "bg-secondary")}
          asChild
        >
          <Link href={route.href}>
            <route.icon className="mr-2 h-4 w-4" />
            {route.title}
          </Link>
        </Button>
      ))}
    </div>
  )
}

export default AdminSidebarContent
