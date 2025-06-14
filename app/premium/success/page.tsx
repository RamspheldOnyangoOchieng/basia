"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      setMessage("No session ID provided. Unable to verify payment.")
      return
    }

    const verifyPayment = async () => {
      try {
        // First verify the payment
        const verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        })

        const verifyData = await verifyResponse.json()

        if (!verifyData.success) {
          throw new Error(verifyData.error || "Failed to verify payment")
        }

        // Then sync with Stripe to ensure transaction is logged
        const syncResponse = await fetch(`/api/sync-stripe-transactions?session_id=${sessionId}`)
        const syncData = await syncResponse.json()

        // Log the sync response for debugging
        console.log("Sync response:", syncData)

        // Try to update the transaction status, but don't fail if this doesn't work
        try {
          const updateResponse = await fetch("/api/update-transaction-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
              status: "success",
              metadata: {
                success_page_visited: true,
                success_timestamp: new Date().toISOString(),
                sync_data: syncData.success ? { synced: syncData.synced } : null,
              },
            }),
          })

          const updateData = await updateResponse.json()
          console.log("Update transaction status response:", updateData)

          // Store debug info but don't show to user
          setDebugInfo({ syncData, updateData })
        } catch (updateError) {
          console.warn("Failed to update transaction status:", updateError)
          // Don't fail the whole process if this step fails
        }

        // If payment was successful, update the UI
        setStatus("success")
        setMessage(
          verifyData.isPaid
            ? "Your payment was successful! Your premium features are now active."
            : "Your payment is being processed. Premium features will be activated once payment is confirmed.",
        )

        // After 5 seconds, redirect to home page
        setTimeout(() => {
          router.push("/")
        }, 5000)
      } catch (error: any) {
        console.error("Payment verification error:", error)
        setStatus("error")
        setMessage(`Payment verification failed: ${error.message}`)
        setDebugInfo({ error: error.message })
      }
    }

    verifyPayment()
  }, [sessionId, router])

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Payment {status === "success" ? "Successful" : status === "error" ? "Failed" : "Processing"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" ? "Verifying your payment..." : ""}
            {status === "success" ? "You will be redirected to the home page shortly." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
          {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

          <p className="mt-4 text-center">{message}</p>

          {/* Only show session ID in development */}
          {process.env.NODE_ENV === "development" && sessionId && (
            <p className="mt-2 text-xs text-gray-500">Session ID: {sessionId}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
