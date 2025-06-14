import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = await createAdminClient()

    // Get the anonymous ID from the cookie or query parameter
    const anonymousId =
      request.cookies.get("anonymous_id")?.value || request.nextUrl.searchParams.get("anonymous_id") || "anonymous"

    // Query images for the anonymous user
    const { data, error } = await supabaseAdmin
      .from("generated_images")
      .select("*")
      .eq("user_id", anonymousId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user images:", error)
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
    }

    return NextResponse.json({ images: data || [] })
  } catch (error) {
    console.error("Error in user-images API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
