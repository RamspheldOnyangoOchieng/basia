"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-context"
import { useSite } from "@/components/site-context"
import { useAuth } from "@/components/auth-context"
import { useState } from "react"

export function UserHeader() {
  const { toggle } = useSidebar()
  const { settings } = useSite()
  const { user, logout } = useAuth()

  // Add state for the active character type
  const [activeType, setActiveType] = useState<string>("Girls")
  // Fixed character types to match the reference design
  const characterTypes = ["Girls", "Anime", "Guys"]

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggle}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-white">
              candy<span className="text-primary">.ai</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <span className="text-sm text-gray-300 mr-2 hidden sm:inline">Hi, {user.username}!</span>
              <Button
                variant="outline"
                className="login-button hover:bg-[#e75275]/10 text-xs sm:text-sm"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button
                  variant="default"
                  className="account-button text-white hover:bg-[#d14868] text-xs sm:text-sm whitespace-nowrap"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="login-button hover:bg-[#e75275]/10 text-xs sm:text-sm">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Character Type Tabs - Only show on homepage */}
      {window.location.pathname === "/" && (
        <div className="flex justify-center border-t border-border overflow-x-auto">
          {characterTypes.map((type) => (
            <Button
              key={type}
              variant="ghost"
              className={`rounded-none px-6 py-3 ${
                activeType === type ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
              onClick={() => setActiveType(type)}
            >
              {type === "Girls" && <span className="mr-1.5 text-pink-500">♀</span>}
              {type === "Anime" && <span className="mr-1.5">⭐</span>}
              {type === "Guys" && <span className="mr-1.5 text-blue-500">♂</span>}
              {type}
            </Button>
          ))}
        </div>
      )}
    </header>
  )
}
