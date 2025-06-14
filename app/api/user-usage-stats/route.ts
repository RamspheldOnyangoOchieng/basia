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
    // Get total images generated
    const { count: imagesGenerated, error: imagesError } = await supabase
      .from("generated_images")
      .select("*", { count: "exact" })
      .eq("user_id", userId)

    if (imagesError) {
      console.error("Error fetching images count:", imagesError)
    }

    // Get total tokens spent
    const { data: tokensData, error: tokensError } = await supabase
      .from("token_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "usage")
      .order("created_at", { ascending: false })

    if (tokensError) {
      console.error("Error fetching token usage:", tokensError)
    }

    // Calculate total tokens spent (absolute value since usage is negative)
    const tokensSpent = tokensData?.reduce((total, tx) => total + Math.abs(tx.amount), 0) || 0

    // Get last generation time
    const { data: lastGeneration, error: lastGenError } = await supabase
      .from("generated_images")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (lastGenError && lastGenError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Error fetching last generation:", lastGenError)
    }

    // Format last generation time
    let lastGenerationTime = "Never"
    if (lastGeneration?.created_at) {
      const date = new Date(lastGeneration.created_at)
      lastGenerationTime = date.toLocaleString()
    }

    return NextResponse.json({
      success: true,
      imagesGenerated: imagesGenerated || 0,
      tokensSpent,
      lastGeneration: lastGenerationTime,
    })
  } catch (error) {
    console.error("Error fetching user usage stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch usage stats" }, { status: 500 })
  }
}
