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

  try {
    const { data, error } = await supabase.from("user_tokens").select("balance").eq("user_id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching token balance:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch token balance" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      balance: data?.balance || 0,
    })
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch token balance" }, { status: 500 })
  }
}
