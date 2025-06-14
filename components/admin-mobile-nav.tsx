"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BookUser, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminMobileNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const isActive = (path: string) => {
    if (!mounted) return false
    return pathname?.startsWith(path)
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <Link
        href="/admin/dashboard"
        className={`flex flex-col items-center justify-center p-2 ${
          isActive("/admin/dashboard") &&
          !isActive("/admin/dashboard/users") &&
          !isActive("/admin/dashboard/characters") &&
          !isActive("/admin/dashboard/api-keys") &&
          !isActive("/admin/dashboard/database") &&
          !isActive("/admin/dashboard/image-suggestions")
            ? "text-primary"
            : "text-muted-foreground"
        }`}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-xs">Dashboard</span>
      </Link>
      <Link
        href="/admin/dashboard/users"
        className={`flex flex-col items-center justify-center p-2 ${
          isActive("/admin/dashboard/users") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Users className="h-5 w-5" />
        <span className="text-xs">Users</span>
      </Link>
      <Link
        href="/admin/dashboard/characters"
        className={`flex flex-col items-center justify-center p-2 ${
          isActive("/admin/dashboard/characters") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <BookUser className="h-5 w-5" />
        <span className="text-xs">Characters</span>
      </Link>
      <Link
        href="/admin/payment-methods"
        className={`flex flex-col items-center justify-center p-2 ${
          isActive("/admin/payment-methods") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <CreditCard className="h-5 w-5" />
        <span className="text-xs">Payments</span>
      </Link>
    </>
  )
}
