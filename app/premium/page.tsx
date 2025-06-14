"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Check, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-context"
import type { SubscriptionPlan } from "@/types/subscription"

export default function PremiumPage() {
  // Add token packages data at the top of the component function
  const tokenPackages = [
    { id: "token_200", name: "Basic", tokens: 200, price: 9.99 },
    { id: "token_550", name: "Standard", tokens: 550, price: 34.99 },
    { id: "token_5800", name: "Super Value", tokens: 5800, price: 49.99 },
    { id: "token_1550", name: "Premium", tokens: 1550, price: 99.99 },
    { id: "token_2900", name: "Professional", tokens: 2900, price: 199.99 },
    { id: "token_5000", name: "Enterprise", tokens: 5000, price: 299.99 },
  ]

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const statusCheckRef = useRef<boolean>(false)

  // Add state for token section
  const [selectedTokenPackageId, setSelectedTokenPackageId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"subscription" | "tokens">("subscription")

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true)
        const response = await fetch("/api/subscription-plans")

        if (!response.ok) {
          throw new Error("Failed to fetch subscription plans")
        }

        const data = await response.json()
        setPlans(data)

        // Select the most popular plan by default, or the first plan
        const popularPlan = data.find((plan: SubscriptionPlan) => plan.is_popular)
        setSelectedPlanId(popularPlan ? popularPlan.id : data[0]?.id || null)
      } catch (error) {
        console.error("Error fetching subscription plans:", error)
        toast.error("Failed to load subscription plans. Please try again later.")
      } finally {
        setIsLoadingPlans(false)
      }
    }

    fetchPlans()
  }, [])

  // Update the useEffect for checking premium status to be more efficient
  useEffect(() => {
    // Check premium status using the auth context
    const checkPremiumStatus = async () => {
      // Prevent multiple simultaneous checks
      if (statusCheckRef.current) return
      statusCheckRef.current = true

      try {
        setIsCheckingStatus(true)
        setStatusError(null)

        // If no user, we're not authenticated - but don't block the page
        if (!user) {
          setIsCheckingStatus(false)
          statusCheckRef.current = false
          return
        }

        // Simple direct check without multiple retries
        try {
          const response = await fetch("/api/check-premium-status")
          const data = await response.json()

          if (data.error) {
            console.error("Premium status error:", data.error)
            setStatusError(`Error checking premium status`)
          } else {
            setIsPremium(!!data.isPremium)
          }
        } catch (error) {
          console.error("Error checking premium status:", error)
          setStatusError("Failed to check premium status")
        }
      } finally {
        setIsCheckingStatus(false)
        statusCheckRef.current = false
      }
    }

    checkPremiumStatus()
  }, [user])

  // Simplify the handlePayment function
  const handlePayment = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a subscription plan")
      return
    }

    try {
      setIsLoading(true)

      // Get the selected plan
      const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)
      if (!selectedPlan) {
        throw new Error("Selected plan not found")
      }

      // Create checkout session - use user from auth context
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          userId: user?.id,
          email: user?.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to process payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Add handleTokenPurchase function after the handlePayment function
  const handleTokenPurchase = async () => {
    if (!selectedTokenPackageId) {
      toast.error("Please select a token package")
      return
    }

    try {
      setIsLoading(true)

      // Get the selected token package
      const selectedPackage = tokenPackages.find((pkg) => pkg.id === selectedTokenPackageId)
      if (!selectedPackage) {
        throw new Error("Selected token package not found")
      }

      // Create checkout session for tokens
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedTokenPackageId,
          userId: user?.id,
          email: user?.email,
          metadata: {
            type: "token_purchase",
            tokens: selectedPackage.tokens,
            price: selectedPackage.price,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to process token purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price)
  }

  // Helper function to get duration text
  const getDurationText = (duration: number) => {
    if (duration === 1) return "month"
    if (duration === 3) return "3 months"
    if (duration === 6) return "6 months"
    if (duration === 12) return "year"
    return `${duration} months`
  }

  if (isCheckingStatus || isLoadingPlans) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If not authenticated, show login prompt
  if (!user) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Login Required</h1>
            <p className="text-muted-foreground">Please log in to access premium features</p>
          </div>
          <Button className="w-full" onClick={() => router.push("/login?redirect=/premium")}>
            Log In
          </Button>
        </Card>
      </div>
    )
  }

  // If there was an error checking status
  if (statusError) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Error</h1>
            <p className="text-muted-foreground">There was an error checking your premium status</p>
            {process.env.NODE_ENV === "development" && <p className="text-xs text-destructive mt-2">{statusError}</p>}
          </div>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  // If no plans are available
  if (plans.length === 0) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">No Plans Available</h1>
            <p className="text-muted-foreground">There are currently no subscription plans available.</p>
          </div>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Card>
      </div>
    )
  }

  // Replace the return statement with the updated UI that includes tabs for subscriptions and tokens
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose your Plan</h1>
        <p className="text-muted-foreground">100% anonymous. You can cancel anytime.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/20">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "subscription" ? "bg-[#a55ebf] text-white shadow-sm" : "text-foreground hover:bg-muted"
            }`}
            onClick={() => setActiveTab("subscription")}
          >
            Subscriptions
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "tokens" ? "bg-[#a55ebf] text-white shadow-sm" : "text-foreground hover:bg-muted"
            }`}
            onClick={() => setActiveTab("tokens")}
          >
            Buy Tokens
          </button>
        </div>
      </div>

      {activeTab === "subscription" && (
        <Card className="p-8 relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-6">
            {/* Left side - Promo and image */}
            <div className="md:col-span-3">
              <div className="mb-8">
                <h2 className="text-primary text-2xl font-bold">Spring Sale</h2>
                <h3 className="text-3xl font-bold mb-2">for New Users</h3>
                <p className="text-sm">
                  Discount ends soon. <span className="text-destructive font-semibold">Don't miss out!</span>
                </p>
              </div>

              <div className="hidden md:block">
                {plans.find((plan) => plan.id === selectedPlanId)?.promotional_image ? (
                  <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                    <Image
                      src={plans.find((plan) => plan.id === selectedPlanId)?.promotional_image || "/placeholder.svg"}
                      alt="Promotional Image"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <img src="/placeholder.svg?height=500&width=300" alt="AI Character" className="rounded-lg" />
                )}
              </div>
            </div>

            {/* Middle - Pricing options */}
            <div className="md:col-span-5 space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                    selectedPlanId === plan.id
                      ? "bg-gradient-to-r from-[#a55ebf] to-[#c478d4] text-white shadow-lg border-2 border-[#a55ebf] transform scale-[1.02] ring-2 ring-[#a55ebf]/30"
                      : "bg-card hover:bg-[#a55ebf]/5 border border-border hover:border-[#a55ebf]/50 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-xl">{plan.name}</div>
                    {plan.discount_percentage && plan.discount_percentage > 0 && (
                      <div className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {plan.discount_percentage}% OFF
                      </div>
                    )}
                    {plan.is_popular && !plan.discount_percentage && (
                      <div className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">POPULAR</div>
                    )}
                  </div>
                  <div className={`text-sm ${selectedPlanId === plan.id ? "text-white/80" : "text-muted-foreground"}`}>
                    {plan.original_price !== plan.discounted_price && plan.discounted_price !== null && (
                      <>
                        Was {formatPrice(plan.original_price)}/{getDurationText(plan.duration)}
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan.discounted_price || plan.original_price).split(".")[0]}
                    </span>
                    <span className="text-xl font-bold">
                      {formatPrice(plan.discounted_price || plan.original_price).split(".")[1]
                        ? `.${formatPrice(plan.discounted_price || plan.original_price).split(".")[1]}`
                        : ".00"}
                    </span>
                    <span
                      className={`text-sm ml-1 ${selectedPlanId === plan.id ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      /{getDurationText(plan.duration)}
                    </span>
                  </div>
                  {selectedPlanId === plan.id && (
                    <div className="mt-2 flex items-center">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-2">
                        <div className="w-2 h-2 rounded-full bg-[#a55ebf]"></div>
                      </div>
                      <span className="text-sm font-medium">Selected Plan</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Additional info */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  No adult transaction in your bank statement
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  No hidden fees • Cancel subscription at any time
                </div>
              </div>

              {/* Payment button */}
              <Button
                className="w-full bg-[#a55ebf] hover:bg-[#a55ebf]/90 text-white flex items-center justify-center gap-2 h-12 mt-6 transition-all duration-300"
                onClick={handlePayment}
                disabled={isLoading || isPremium || !selectedPlanId}
              >
                {isLoading ? "Processing..." : isPremium ? "Already Premium" : "Pay with Credit / Debit Card"}
                {!isLoading && !isPremium && (
                  <span className="flex items-center gap-1">
                    <img src="/visa-logo.svg" alt="Visa" className="h-5" />
                    <img src="/mastercard-logo.svg" alt="Mastercard" className="h-5" />
                  </span>
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground mt-2">
                {selectedPlanId && (
                  <>
                    {plans.find((plan) => plan.id === selectedPlanId)?.duration === 1 ? "Monthly" : "One-time"} payment
                    of{" "}
                    {formatPrice(
                      plans.find((plan) => plan.id === selectedPlanId)?.discounted_price ||
                        plans.find((plan) => plan.id === selectedPlanId)?.original_price ||
                        0,
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right side - Benefits and image */}
            <div className="md:col-span-4">
              <h3 className="text-2xl font-bold mb-4">Premium Benefits</h3>
              {selectedPlanId && plans.find((plan) => plan.id === selectedPlanId)?.features && (
                <ul className="space-y-3 mb-8">
                  {plans
                    .find((plan) => plan.id === selectedPlanId)
                    ?.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-[#a55ebf] mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
              )}

              <div className="hidden md:block mt-8">
                {plans.find((plan) => plan.id === selectedPlanId)?.features_image ? (
                  <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                    <Image
                      src={plans.find((plan) => plan.id === selectedPlanId)?.features_image || "/placeholder.svg"}
                      alt="Features Image"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <img src="/placeholder.svg?height=500&width=300" alt="AI Character" className="rounded-lg" />
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "tokens" && (
        <Card className="p-8 relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-6">
            {/* Left side - Token info */}
            <div className="md:col-span-3">
              <div className="mb-8">
                <h2 className="text-primary text-2xl font-bold">Token System</h2>
                <h3 className="text-3xl font-bold mb-2">Pay As You Go</h3>
                <p className="text-sm">
                  Purchase tokens to generate images.{" "}
                  <span className="text-[#a55ebf] font-semibold">5 tokens per image.</span>
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2">How Tokens Work</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#a55ebf] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Each image generation costs 5 tokens</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#a55ebf] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Tokens never expire</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#a55ebf] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Buy in bulk for better value</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Middle - Token packages */}
            <div className="md:col-span-5">
              <h3 className="text-xl font-bold mb-4">Select Token Package</h3>
              <div className="space-y-4">
                {tokenPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                      selectedTokenPackageId === pkg.id
                        ? "bg-gradient-to-r from-[#a55ebf] to-[#c478d4] text-white shadow-lg border-2 border-[#a55ebf] transform scale-[1.02] ring-2 ring-[#a55ebf]/30"
                        : "bg-card hover:bg-[#a55ebf]/5 border border-border hover:border-[#a55ebf]/50 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTokenPackageId(pkg.id)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-lg">{pkg.name}</div>
                      {pkg.id === "token_5800" && (
                        <div className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded">BEST VALUE</div>
                      )}
                      {pkg.id === "token_550" && (
                        <div className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded">POPULAR</div>
                      )}
                    </div>

                    <div className="flex items-center mt-1">
                      <span className={`text-3xl font-bold ${selectedTokenPackageId === pkg.id ? "text-white" : ""}`}>
                        {pkg.tokens}
                      </span>
                      <span
                        className={`ml-2 ${selectedTokenPackageId === pkg.id ? "text-white/90" : "text-muted-foreground"}`}
                      >
                        tokens
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <div
                        className={`${selectedTokenPackageId === pkg.id ? "text-white/90" : "text-muted-foreground"} text-sm`}
                      >
                        {Math.floor(pkg.tokens / 5)} images
                      </div>
                      <div className="font-bold">{formatPrice(pkg.price)}</div>
                    </div>

                    {selectedTokenPackageId === pkg.id && (
                      <div className="mt-2 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center mr-2">
                          <div className="w-2 h-2 rounded-full bg-[#a55ebf]"></div>
                        </div>
                        <span className="text-sm font-medium">Selected Package</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Token purchase button */}
              <Button
                className="w-full bg-[#a55ebf] hover:bg-[#a55ebf]/90 text-white flex items-center justify-center gap-2 h-12 mt-6 transition-all duration-300"
                onClick={handleTokenPurchase}
                disabled={isLoading || !selectedTokenPackageId}
              >
                {isLoading ? "Processing..." : "Purchase Tokens"}
                {!isLoading && (
                  <span className="flex items-center gap-1">
                    <img src="/visa-logo.svg" alt="Visa" className="h-5" />
                    <img src="/mastercard-logo.svg" alt="Mastercard" className="h-5" />
                  </span>
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground mt-2">
                {selectedTokenPackageId && (
                  <>
                    One-time payment of{" "}
                    {formatPrice(tokenPackages.find((pkg) => pkg.id === selectedTokenPackageId)?.price || 0)}
                  </>
                )}
              </div>
            </div>

            {/* Right side - Value comparison */}
            <div className="md:col-span-4">
              <h3 className="text-xl font-bold mb-4">Value Comparison</h3>
              <div className="space-y-4">
                {tokenPackages.map((pkg) => {
                  const costPerToken = pkg.price / pkg.tokens
                  const costPerImage = costPerToken * 5
                  const savings =
                    ((tokenPackages[0].price / tokenPackages[0].tokens - costPerToken) /
                      (tokenPackages[0].price / tokenPackages[0].tokens)) *
                    100

                  return (
                    <div
                      key={`value-${pkg.id}`}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{pkg.tokens} tokens</div>
                        <div className="text-sm text-muted-foreground">${costPerImage.toFixed(2)} per image</div>
                      </div>
                      {pkg.id !== "token_200" && (
                        <div className="bg-[#a55ebf]/10 text-[#a55ebf] px-2 py-1 rounded text-sm font-medium">
                          Save {savings.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-medium mb-2">Why Buy Tokens?</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#a55ebf] mr-2 mt-0.5 flex-shrink-0" />
                    <span>No recurring payments</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#a55ebf] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Pay only for what you need</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#a55ebf] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Higher quality image generation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Security badges */}
      <div className="flex justify-center mt-8 space-x-8">
        <div className="flex items-center text-muted-foreground">
          <Shield className="h-5 w-5 mr-2" />
          <span>Antivirus Secured</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Lock className="h-5 w-5 mr-2" />
          <span>Privacy in bank statement</span>
        </div>
      </div>
    </div>
  )
}
