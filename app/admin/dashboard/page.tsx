"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-context"
import { useSite } from "@/components/site-context"
import { useCharacters } from "@/components/character-context"
import { Home, Save, Edit, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const { settings, updateSettings } = useSite()
  const { characters } = useCharacters()
  const router = useRouter()
  const [siteName, setSiteName] = useState(settings.siteName)
  const [logoText, setLogoText] = useState(settings.logoText)
  const [currency, setCurrency] = useState(settings.pricing.currency)
  const [currencyPosition, setCurrencyPosition] = useState(settings.pricing.currencyPosition)
  const [monthlyPrice, setMonthlyPrice] = useState(settings.pricing.monthly.price.toString())
  const [monthlyOriginalPrice, setMonthlyOriginalPrice] = useState(settings.pricing.monthly.originalPrice.toString())
  const [monthlyDiscount, setMonthlyDiscount] = useState(settings.pricing.monthly.discount.toString())
  const [quarterlyPrice, setQuarterlyPrice] = useState(settings.pricing.quarterly.price.toString())
  const [quarterlyOriginalPrice, setQuarterlyOriginalPrice] = useState(
    settings.pricing.quarterly.originalPrice.toString(),
  )
  const [quarterlyDiscount, setQuarterlyDiscount] = useState(settings.pricing.quarterly.discount.toString())
  const [yearlyPrice, setYearlyPrice] = useState(settings.pricing.yearly.price.toString())
  const [yearlyOriginalPrice, setYearlyOriginalPrice] = useState(settings.pricing.yearly.originalPrice.toString())
  const [yearlyDiscount, setYearlyDiscount] = useState(settings.pricing.yearly.discount.toString())
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      updateSettings({
        siteName,
        logoText,
        pricing: {
          currency,
          currencyPosition,
          monthly: {
            price: Number.parseFloat(monthlyPrice),
            originalPrice: Number.parseFloat(monthlyOriginalPrice),
            discount: Number.parseInt(monthlyDiscount),
          },
          quarterly: {
            price: Number.parseFloat(quarterlyPrice),
            originalPrice: Number.parseFloat(quarterlyOriginalPrice),
            discount: Number.parseInt(quarterlyDiscount),
          },
          yearly: {
            price: Number.parseFloat(yearlyPrice),
            originalPrice: Number.parseFloat(yearlyOriginalPrice),
            discount: Number.parseInt(yearlyDiscount),
          },
        },
      })
      setSaveMessage("Settings saved successfully!")
      setIsSaving(false)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage("")
      }, 3000)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Site Settings</h2>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">General Settings</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-300">
                    Site Name
                  </label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                  <p className="text-xs text-gray-400">
                    This will be displayed in the browser tab and various places throughout the site.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="logoText" className="block text-sm font-medium text-gray-300">
                    Logo Text
                  </label>
                  <Input
                    id="logoText"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="bg-[#252525] border-[#333] text-white"
                  />
                  <p className="text-xs text-gray-400">The text part of the logo (before the .ai)</p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#FF4D8D] hover:bg-[#FF3D7D] text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>

                  {saveMessage && <p className="mt-2 text-green-400 text-sm">{saveMessage}</p>}
                </div>
              </div>
            </div>

            {/* Site Footer Editor Section */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Site Footer Editor</h3>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Customize the site footer content, links, and contact information.
                </p>

                <div className="flex flex-col space-y-2">
                  <div className="bg-[#252525] rounded-lg p-4 border border-[#333]">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Footer Content</h4>
                    <p className="text-xs text-gray-400 mb-4">
                      Edit the footer sections, links, and contact information directly on the site.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        onClick={() => router.push("/#footer-edit")}
                        className="bg-[#2A2A2A] hover:bg-[#333] text-white border border-[#444]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Footer Content
                      </Button>

                      <Button
                        onClick={() => router.push("/admin/footer-settings")}
                        className="bg-[#2A2A2A] hover:bg-[#333] text-white border border-[#444]"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Advanced Footer Settings
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[#252525] rounded-lg p-4 border border-[#333]">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Footer Display Options</h4>

                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox id="showFooter" />
                      <label htmlFor="showFooter" className="text-sm text-gray-300">
                        Show footer on all pages
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="showPaymentIcons" defaultChecked />
                      <label htmlFor="showPaymentIcons" className="text-sm text-gray-300">
                        Show payment method icons
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Premium Pricing</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
                    Currency Symbol
                  </Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-[#252525] border-[#333] text-white w-24"
                    placeholder="$"
                  />
                  <p className="text-xs text-gray-400 mt-1">The currency symbol to display (e.g., $, €, £, ¥)</p>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-300 mb-2">Currency Position</Label>
                  <RadioGroup
                    value={currencyPosition}
                    onValueChange={(value) => setCurrencyPosition(value as "left" | "right")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="left" />
                      <Label htmlFor="left" className="text-white">
                        Left ({currency}100)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="right" />
                      <Label htmlFor="right" className="text-white">
                        Right (100{currency})
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-gray-400 mt-1">Position of the currency symbol relative to the price</p>
                </div>
              </div>

              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyPrice">Price</Label>
                      <Input
                        id="monthlyPrice"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyOriginalPrice">Original Price</Label>
                      <Input
                        id="monthlyOriginalPrice"
                        value={monthlyOriginalPrice}
                        onChange={(e) => setMonthlyOriginalPrice(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyDiscount">Discount (%)</Label>
                      <Input
                        id="monthlyDiscount"
                        value={monthlyDiscount}
                        onChange={(e) => setMonthlyDiscount(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="quarterly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyPrice">Price</Label>
                      <Input
                        id="quarterlyPrice"
                        value={quarterlyPrice}
                        onChange={(e) => setQuarterlyPrice(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyOriginalPrice">Original Price</Label>
                      <Input
                        id="quarterlyOriginalPrice"
                        value={quarterlyOriginalPrice}
                        onChange={(e) => setQuarterlyOriginalPrice(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quarterlyDiscount">Discount (%)</Label>
                      <Input
                        id="quarterlyDiscount"
                        value={quarterlyDiscount}
                        onChange={(e) => setQuarterlyDiscount(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearlyPrice">Price</Label>
                      <Input
                        id="yearlyPrice"
                        value={yearlyPrice}
                        onChange={(e) => setYearlyPrice(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearlyOriginalPrice">Original Price</Label>
                      <Input
                        id="yearlyOriginalPrice"
                        value={yearlyOriginalPrice}
                        onChange={(e) => setYearlyOriginalPrice(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearlyDiscount">Discount (%)</Label>
                      <Input
                        id="yearlyDiscount"
                        value={yearlyDiscount}
                        onChange={(e) => setYearlyDiscount(e.target.value)}
                        className="bg-[#252525] border-[#333] text-white"
                        type="number"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              <div className="p-4 border border-[#252525] rounded-lg">
                <div className="text-xl font-bold flex items-center">
                  {logoText}
                  <span className="text-[#FF4D8D]">.ai</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Browser title: {siteName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
