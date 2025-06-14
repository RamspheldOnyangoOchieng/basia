import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use proper server-side env vars
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
}

const adminClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 })
    }

    try {
      await adminClient.rpc("disable_rls")
    } catch (rlsError) {
      console.log("Could not disable RLS, continuing with service role:", rlsError)
    }

    const { error } = await adminClient.from("faqs").delete().eq("id", id)

    if (error) {
      console.error("Error deleting FAQ:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
