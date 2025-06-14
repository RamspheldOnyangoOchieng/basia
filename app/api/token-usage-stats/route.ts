import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const searchParams = request.nextUrl.searchParams
  const timeframe = searchParams.get("timeframe") || "week"

  try {
    let interval: string
    let dateFormat: string

    // Set SQL interval and date format based on timeframe
    switch (timeframe) {
      case "week":
        interval = "7 days"
        dateFormat = "Dy" // Day name (Mon, Tue, etc.)
        break
      case "month":
        interval = "30 days"
        dateFormat = "DD" // Day of month (01-31)
        break
      case "year":
        interval = "1 year"
        dateFormat = "Mon" // Month name (Jan, Feb, etc.)
        break
      default:
        interval = "7 days"
        dateFormat = "Dy"
    }

    // Query to get usage data grouped by date
    const { data: usageData, error } = await supabase.rpc("get_token_usage_stats", {
      p_user_id: userId,
      p_interval: interval,
      p_date_format: dateFormat,
    })

    if (error) {
      console.error("Error fetching usage stats:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch usage stats" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      usageData: usageData || [],
    })
  } catch (error) {
    console.error("Error fetching token usage stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch usage stats" }, { status: 500 })
  }
}
