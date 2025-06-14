"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ImageIcon, Crown, Moon, Sun, User } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { useTheme } from "@/components/theme-provider"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // Don't show the mobile nav on chat pages
  if (pathname?.startsWith("/chat")) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card border-t border-border p-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center p-2">
            <Home className={`h-6 w-6 ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${pathname === "/" ? "text-primary" : "text-muted-foreground"} mt-1`}>Home</span>
          </Link>
          <Link href="/generate" className="flex flex-col items-center p-2">
            <ImageIcon className={`h-6 w-6 ${pathname === "/generate" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${pathname === "/generate" ? "text-primary" : "text-muted-foreground"} mt-1`}>
              Generate
            </span>
          </Link>
          <Link href="/premium" className="flex flex-col items-center p-2">
            <Crown className={`h-6 w-6 ${pathname === "/premium" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${pathname === "/premium" ? "text-primary" : "text-muted-foreground"} mt-1`}>
              Premium
            </span>
          </Link>
          <button onClick={toggleTheme} className="flex flex-col items-center p-2">
            {theme === "dark" ? (
              <>
                <Moon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Light</span>
              </>
            )}
          </button>
          <Link href="/profile" className="flex flex-col items-center p-2">
            <User className={`h-6 w-6 ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs ${pathname === "/profile" ? "text-primary" : "text-muted-foreground"} mt-1`}>
              Profile
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
