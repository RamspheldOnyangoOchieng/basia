"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProfileDashboard } from "@/components/profile-dashboard"
import { useAuth } from "@/components/auth-context"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/login?redirect=/profile")
    }
  }, [mounted, isLoading, user, router])

  if (!mounted || isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a55ebf]"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container max-w-6xl py-8">
      <ProfileDashboard userId={user.id} />
    </div>
  )
}
