"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, ImageIcon, Users, MessageSquare, Star, FolderOpen, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { TokenBalanceDisplay } from "@/components/token-balance-display"
import { useAuth } from "@/components/auth-context"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Generate",
    href: "/generate",
    icon: ImageIcon,
  },
  {
    name: "Characters",
    href: "/characters",
    icon: Users,
  },
  {
    name: "Prompts",
    href: "/prompts",
    icon: MessageSquare,
  },
  {
    name: "Favorites",
    href: "/favorites",
    icon: Star,
  },
  {
    name: "Collections",
    href: "/collections",
    icon: FolderOpen,
  },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="flex items-center">
      <nav className="flex items-center space-x-4 lg:space-x-6 mr-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-[#a55ebf]",
                isActive ? "text-[#a55ebf]" : "text-muted-foreground",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        {user && (
          <Link
            href="/profile"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-[#a55ebf]",
              pathname === "/profile" ? "text-[#a55ebf]" : "text-muted-foreground",
            )}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        )}
      </nav>

      <div className="flex items-center space-x-4">
        {user && <TokenBalanceDisplay className="mr-2" />}
        <ThemeToggle />
      </div>
    </div>
  )
}
