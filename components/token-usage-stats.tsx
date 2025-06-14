"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface UsageData {
  name: string
  tokens: number
  images: number
}

interface TokenUsageStatsProps {
  userId: string
}

export function TokenUsageStats({ userId }: TokenUsageStatsProps) {
  const [timeframe, setTimeframe] = useState("week")
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsageStats() {
      setLoading(true)
      try {
        const response = await fetch(`/api/token-usage-stats?timeframe=${timeframe}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUsageData(data.usageData || [])
          }
        }
      } catch (error) {
        console.error("Error fetching usage stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageStats()
  }, [userId, timeframe])

  // For demo purposes, generate sample data if none exists
  useEffect(() => {
    if (!loading && usageData.length === 0) {
      let sampleData: UsageData[] = []

      if (timeframe === "week") {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        sampleData = days.map((day) => ({
          name: day,
          tokens: Math.floor(Math.random() * 50),
          images: Math.floor(Math.random() * 10),
        }))
      } else if (timeframe === "month") {
        sampleData = Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          tokens: Math.floor(Math.random() * 30),
          images: Math.floor(Math.random() * 6),
        }))
      } else if (timeframe === "year") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        sampleData = months.map((month) => ({
          name: month,
          tokens: Math.floor(Math.random() * 200),
          images: Math.floor(Math.random() * 40),
        }))
      }

      setUsageData(sampleData)
    }
  }, [loading, usageData, timeframe])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Track your token usage over time</CardDescription>
          </div>
          <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[200px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a55ebf]"></div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usageData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tokens" name="Tokens Used" fill="#a55ebf" />
                <Bar dataKey="images" name="Images Generated" fill="#e75275" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
