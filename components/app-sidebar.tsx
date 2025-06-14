"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  MessageSquare,
  Sparkles,
  Crown,
  Search,
  ChevronLeft,
  Menu,
  LogOut,
  User,
  FolderHeart,
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/auth-context"
import { useSidebar } from "@/components/sidebar-context"
import { cn } from "@/lib/utils"
import { useSite } from "@/components/site-context"
import { useEffect } from "react"

export default function AppSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle, close, setIsOpen } = useSidebar()
  const { user, logout } = useAuth()
  const { settings } = useSite()

  // Add useEffect hook at the top level, not conditionally
  useEffect(() => {
    const handleRouteChange = () => {
      // Close sidebar on route change on mobile
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsOpen(false)
      }

      // Auto-collapse sidebar on /generate page regardless of screen size
      if (pathname === "/generate") {
        setIsOpen(false)
      }
    }

    handleRouteChange() // Call it once on mount

    // No cleanup needed for this effect
  }, [pathname, setIsOpen])

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith("/admin")

  // Don't render the main sidebar on admin pages
  if (isAdminPage) {
    return null
  }

  // Only include the actual pages that exist in the application
  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Chat",
      href: "/chat",
      active: pathname?.startsWith("/chat"),
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: "Generate",
      href: "/generate",
      active: pathname?.startsWith("/generate"),
    },
    {
      icon: <FolderHeart className="h-5 w-5" />,
      label: "Collection",
      href: "/collection",
      active: pathname?.startsWith("/collection"),
    },
    {
      icon: <Crown className="h-5 w-5" />,
      label: "Premium",
      href: "/premium",
      active: pathname?.startsWith("/premium"),
    },
  ]

  // Add admin dashboard link if user is admin
  if (user?.isAdmin) {
    menuItems.push({
      icon: <User className="h-5 w-5" />,
      label: "Admin",
      href: "/admin/dashboard",
      active: pathname?.startsWith("/admin"),
    })
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={close} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out
                   ${isOpen ? "w-[251px]" : "w-[59px]"} 
                   bg-background text-foreground shadow-lg border-r border-border
                   md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Mobile close button */}
        <button className="absolute right-4 top-4 md:hidden" onClick={close}>
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className={`flex items-center ${isOpen ? "px-6" : "justify-center"} h-16`}>
          {isOpen ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xl font-bold">
                <span className="text-foreground">Lovegirl</span>
                <span className="text-[#a55ebf]">.ai</span>
              </span>
              <div
                className="w-8 h-8 rounded-md bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors ml-2"
                onClick={toggle}
                aria-label="Toggle sidebar"
                role="button"
                tabIndex={0}
              >
                <Menu className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-md bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={toggle}
              aria-label="Toggle sidebar"
              role="button"
              tabIndex={0}
            >
              <Menu className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Search */}
        <div className={`${isOpen ? "mx-4" : "mx-2"} relative mt-2`}>
          <Search
            className={`absolute ${isOpen ? "left-3" : "left-2"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isOpen ? "hidden" : "block"}`}
          />
          {isOpen ? (
            <div className="h-2"></div>
          ) : (
            <div className="w-12 h-9 bg-secondary rounded-md flex items-center justify-center">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Menu Items - with scrollable container if needed */}
        <nav
          className={`mt-6 ${isOpen ? "px-4" : "px-2"} overflow-y-auto`}
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md",
                    isOpen ? "px-3 py-2" : "justify-center py-2",
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-[#a55ebf]/10 hover:border-[#a55ebf]/30 hover:text-[#a55ebf] border border-border",
                  )}
                >
                  <span>{item.icon}</span>
                  {isOpen && <span className="ml-3 text-sm">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div
          className={`absolute bottom-0 left-0 right-0 border-t border-border ${isOpen ? "p-4" : "p-2"} bg-background`}
        >
          {user ? (
            <Link href="/profile" className="block">
              <div
                className={`flex ${isOpen ? "items-center" : "flex-col items-center"} cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors`}
              >
                <div className={`${isOpen ? "mr-3" : "mb-2"} relative`}>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <Image
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.isAdmin ? "Admin" : "User"}</p>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            // Keep the existing login/signup buttons unchanged
            <div className={`${isOpen ? "space-y-2" : "flex flex-col items-center space-y-2"}`}>
              <Link href="/login" className={`block ${!isOpen && "w-full flex justify-center"}`}>
                <Button variant="outline" className={`${isOpen ? "w-full" : "w-10 h-8 p-0"}`}>
                  {isOpen ? "Login" : <User className="h-4 w-4" />}
                </Button>
              </Link>
              {isOpen && (
                <Link href="/signup" className="block">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              )}
            </div>
          )}
          {user && (
            <button
              onClick={logout}
              className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground z-10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
