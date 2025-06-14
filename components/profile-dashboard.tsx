"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coins, CreditCard, TrendingUp, User, Calendar, ImageIcon } from "lucide-react"
import { TokenTransactionHistory } from "./token-transaction-history"
import { TokenUsageStats } from "./token-usage-stats"
import { UserProfileInfo } from "./user-profile-info"
import Link from "next/link"

interface ProfileDashboardProps {
  userId: string
}

interface TokenBalance {
  balance: number
}

interface UserStats {
  totalImagesGenerated: number
  totalTokensSpent: number
  lastGenerationDate: string | null
}

export function ProfileDashboard({ userId }: ProfileDashboardProps) {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch token balance
        const balanceResponse = await fetch("/api/user-token-balance")
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json()
          setTokenBalance(balanceData)
        }

        // Fetch user stats
        const statsResponse = await fetch("/api/user-usage-stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setUserStats(statsData)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a55ebf]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account, view your token balance, and track your usage.</p>
      </div>

      {/* Token Balance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#a55ebf]">{tokenBalance?.balance || 0}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.floor((tokenBalance?.balance || 0) / 5)} images available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalImagesGenerated || 0}</div>
            <p className="text-xs text-muted-foreground">Total images created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalTokensSpent || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime token usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.lastGenerationDate ? new Date(userStats.lastGenerationDate).toLocaleDateString() : "Never"}
            </div>
            <p className="text-xs text-muted-foreground">Last image generation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common actions you might want to take</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/premium">
              <CreditCard className="mr-2 h-4 w-4" />
              Buy Tokens
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/generate">
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Images
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/collection">
              <User className="mr-2 h-4 w-4" />
              View Collection
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 rounded-lg border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="account">Account Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Status</CardTitle>
                <CardDescription>Your current token balance and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Balance:</span>
                  <Badge variant="secondary" className="text-[#a55ebf]">
                    {tokenBalance?.balance || 0} tokens
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Images Available:</span>
                  <span className="font-medium">~{Math.floor((tokenBalance?.balance || 0) / 5)} images</span>
                </div>
                {(tokenBalance?.balance || 0) < 25 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Low token balance! Consider purchasing more tokens to continue generating images.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Summary</CardTitle>
                <CardDescription>Your activity at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Images:</span>
                  <span className="font-medium">{userStats?.totalImagesGenerated || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tokens Used:</span>
                  <span className="font-medium">{userStats?.totalTokensSpent || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg. per Image:</span>
                  <span className="font-medium">
                    {userStats?.totalImagesGenerated
                      ? Math.round((userStats.totalTokensSpent || 0) / userStats.totalImagesGenerated)
                      : 0}{" "}
                    tokens
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TokenTransactionHistory userId={userId} />
        </TabsContent>

        <TabsContent value="usage">
          <TokenUsageStats userId={userId} />
        </TabsContent>

        <TabsContent value="account">
          <UserProfileInfo userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
