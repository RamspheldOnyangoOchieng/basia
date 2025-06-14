import { type NextRequest, NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe-utils"
import { savePaymentTransaction } from "@/lib/payment-utils"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 })
    }

    const stripe = await getStripeInstance()
    if (!stripe) {
      return NextResponse.json({ success: false, error: "Stripe is not configured" }, { status: 500 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer", "line_items"],
    })

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
    }

    // Check if this is a token purchase
    const isTokenPurchase = session.metadata?.type === "token_purchase"

    // Process payment data
    const paymentData = {
      user_id: session.metadata?.userId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent?.id || null,
      stripe_customer_id: session.customer?.id || null,
      amount: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency?.toUpperCase() || "USD",
      status: session.payment_status || "unknown",
      payment_method: session.payment_method_types?.[0] || null,
      plan_id: isTokenPurchase ? null : session.metadata?.planId || null,
      plan_name: isTokenPurchase ? `${session.metadata?.tokens || 0} Tokens` : session.metadata?.planName || null,
      plan_duration: isTokenPurchase ? null : Number.parseInt(session.metadata?.planDuration || "0"),
      metadata: {
        ...session.metadata,
        line_items: session.line_items?.data,
      },
    }

    // Save the payment transaction
    await savePaymentTransaction(paymentData)

    // If this is a token purchase, add tokens to the user's account
    if (isTokenPurchase && session.payment_status === "paid") {
      const tokenAmount = Number.parseInt(session.metadata?.tokens || "0")
      const userId = session.metadata?.userId

      if (tokenAmount > 0 && userId) {
        const supabase = createClient()

        // Check if user has a token balance record
        const { data: existingBalance } = await supabase
          .from("user_tokens")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        if (existingBalance) {
          // Update existing balance
          await supabase
            .from("user_tokens")
            .update({
              balance: existingBalance.balance + tokenAmount,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
        } else {
          // Create new balance record
          await supabase.from("user_tokens").insert({
            user_id: userId,
            balance: tokenAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        // Add transaction record
        await supabase.from("token_transactions").insert({
          user_id: userId,
          amount: tokenAmount,
          type: "purchase",
          description: `Purchased ${tokenAmount} tokens`,
          payment_id: session.id,
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      isPaid: session.payment_status === "paid",
      isTokenPurchase,
      tokenAmount: isTokenPurchase ? Number.parseInt(session.metadata?.tokens || "0") : 0,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
      },
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
