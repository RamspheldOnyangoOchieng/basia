"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Wand2, Loader2, Download, Share2, AlertCircle, ChevronLeft, FolderOpen } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { ImageModal } from "@/components/image-modal"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import {
  getImageSuggestions,
  getImageSuggestionsByCategory,
  type ImageSuggestion,
} from "@/app/actions/image-suggestions"
import { ThemeToggle } from "@/components/theme-toggle"

const imageOptions = [
  { value: "1", label: "1", tokens: 5 },
  { value: "4", label: "4", tokens: 20 },
  { value: "6", label: "6", tokens: 30 },
  { value: "8", label: "8", tokens: 40 },
]

export default function GenerateImagePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [showNegativePrompt, setShowNegativePrompt] = useState(false)
  const [selectedCount, setSelectedCount] = useState("1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState("")
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [savingImageIndex, setSavingImageIndex] = useState<number | null>(null)
  const [autoSaving, setAutoSaving] = useState(false)

  // Fetch suggestions on component mount
  useEffect(() => {
    async function loadSuggestions() {
      setIsLoadingSuggestions(true)
      try {
        const data = await getImageSuggestions()
        setSuggestions(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((item) => item.category)))
        setCategories(uniqueCategories)

        // Set default active category if available
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0])
        }
      } catch (error) {
        console.error("Error loading suggestions:", error)
        toast({
          title: "Error",
          description: "Failed to load suggestions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    loadSuggestions()
  }, [toast])

  // Handle category change
  const handleCategoryChange = async (category: string) => {
    setActiveCategory(category)
    setIsLoadingSuggestions(true)

    try {
      const data = await getImageSuggestionsByCategory(category)
      setSuggestions(data)
    } catch (error) {
      console.error("Error loading suggestions for category:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }
    }
  }, [])

  // Auto-save generated images when they're ready
  useEffect(() => {
    // Only run this effect when new images are generated and we're not already saving
    if (generatedImages.length > 0 && !autoSaving && user) {
      const saveAllImages = async () => {
        setAutoSaving(true)
        try {
          // Show toast that we're saving images
          toast({
            title: "Saving images",
            description: "Your generated images are being saved to your collection...",
          })

          // Save all images in parallel
          const savePromises = generatedImages.map(
            (imageUrl) => saveImageToCollection(imageUrl, -1, false), // -1 means don't show individual saving indicators
          )

          await Promise.all(savePromises)

          // Show success toast when all images are saved
          toast({
            title: "Images saved",
            description: (
              <div className="flex flex-col gap-2">
                <span>All images have been saved to your collection.</span>
                <Button variant="outline" size="sm" className="mt-1" onClick={() => router.push("/collection")}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Collection
                </Button>
              </div>
            ),
          })
        } catch (error) {
          console.error("Error auto-saving images:", error)
          toast({
            title: "Error",
            description: "Failed to save some images. You can try saving them manually.",
            variant: "destructive",
          })
        } finally {
          setAutoSaving(false)
        }
      }

      saveAllImages()
    }
  }, [generatedImages, user, autoSaving, toast, router])

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      })
      return
    }

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to generate and save images",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])

    try {
      // Start image generation
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          imageCount: Number.parseInt(selectedCount),
          width: 1024,
          height: 1024,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start image generation")
      }

      const data = await response.json()
      const taskId = data.taskId
      setCurrentTaskId(taskId)

      // Start polling for results
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current)
      }

      statusCheckInterval.current = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/check-generation?taskId=${taskId}`)

          if (!statusResponse.ok) {
            const errorData = await statusResponse.json()
            throw new Error(errorData.error || "Failed to check generation status")
          }

          const statusData = await statusResponse.json()

          if (statusData.status === "TASK_STATUS_SUCCEED") {
            // Generation completed successfully
            setGeneratedImages(statusData.images || [])
            setIsGenerating(false)

            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current)
              statusCheckInterval.current = null
            }
          } else if (statusData.status === "TASK_STATUS_FAILED") {
            // Generation failed
            setError(`Generation failed: ${statusData.reason || "Unknown error"}`)
            setIsGenerating(false)

            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current)
              statusCheckInterval.current = null
            }
          }
          // For other statuses (TASK_STATUS_PENDING, TASK_STATUS_RUNNING), continue polling
        } catch (error) {
          console.error("Error checking generation status:", error)
          // Fix: Ensure we're extracting the error message as a string
          setError(
            typeof error === "object" && error !== null && "message" in error
              ? String(error.message)
              : "Failed to check generation status. Please try again.",
          )
          setIsGenerating(false)

          if (statusCheckInterval.current) {
            clearInterval(statusCheckInterval.current)
            statusCheckInterval.current = null
          }
        }
      }, 2000) // Check every 2 seconds
    } catch (error) {
      console.error("Error generating image:", error)
      // Fix: Ensure we're extracting the error message as a string
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "An unexpected error occurred",
      )
      setIsGenerating(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt((prev) => {
      const newPrompt = prev ? `${prev}, ${suggestion}` : suggestion
      return newPrompt
    })
  }

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `generated-image-${index + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl)
    toast({ title: "Image URL copied to clipboard" })
  }

  const handleDownloadAll = async () => {
    try {
      for (let i = 0; i < generatedImages.length; i++) {
        await handleDownload(generatedImages[i], i)
        // Add a small delay between downloads to prevent browser issues
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error("Error downloading all images:", error)
      toast({
        title: "Download failed",
        description: "Failed to download all images. Please try again.",
        variant: "destructive",
      })
    }
  }

  const saveImageToCollection = async (imageUrl: string, index: number, showToast = true) => {
    // Check if user is logged in
    if (!user) {
      if (showToast) {
        toast({
          title: "Login required",
          description: "Please log in to save images to your collection",
          variant: "destructive",
        })
        router.push("/login")
      }
      return false
    }

    try {
      if (index >= 0) {
        setSavingImageIndex(index)
      }

      const response = await fetch("/api/save-generated-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          imageUrl: imageUrl,
          modelUsed: "sd_xl_base_1.0",
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save image")
      }

      if (showToast) {
        toast({
          title: "Success",
          description: "Image saved to your collection",
        })
      }

      return true
    } catch (error) {
      console.error("Error saving image:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save image to collection",
          variant: "destructive",
        })
      }
      return false
    } finally {
      if (index >= 0) {
        setSavingImageIndex(null)
      }
    }
  }

  const viewCollection = () => {
    router.push("/collection")
  }

  // Get selected option for token calculation
  const selectedOption = imageOptions.find((option) => option.value === selectedCount)
  const tokensRequired = selectedOption?.tokens || 5

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* Left Column - Generation Controls */}
      <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="mr-1 p-0" onClick={() => router.back()} aria-label="Go back">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Wand2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Generate Image</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Prompt Input */}
        <div className="relative mb-6">
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Copy
              className="h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(prompt)
                toast({ title: "Copied to clipboard" })
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => {
                navigator.clipboard.readText().then((text) => {
                  setPrompt(text)
                  toast({ title: "Pasted from clipboard" })
                })
              }}
            >
              Paste
            </Button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-card rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-border"
            placeholder="Describe the image you want to generate..."
          />
        </div>

        {/* Negative Prompt Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNegativePrompt(!showNegativePrompt)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showNegativePrompt ? "Hide Negative Prompt" : "Show Negative Prompt"}
          </Button>

          {/* Negative Prompt Input - Only shown when toggled */}
          {showNegativePrompt && (
            <div className="mt-3">
              <label htmlFor="negative-prompt" className="block text-sm font-medium text-muted-foreground mb-2">
                Negative Prompt (what to avoid in the image)
              </label>
              <textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full h-20 bg-card rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary border border-border text-sm"
                placeholder="Elements to exclude from the image..."
              />
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
          {categories.length > 0 ? (
            <Tabs defaultValue={categories[0]} value={activeCategory} onValueChange={handleCategoryChange}>
              <TabsList className="mb-4 bg-card border border-border p-1 rounded-lg">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="capitalize text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1c79ab] data-[state=active]:to-[#00ccff] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 p-1 sm:p-2">
                {isLoadingSuggestions
                  ? // Show loading placeholders
                    Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="aspect-square rounded-lg bg-muted animate-pulse" />
                    ))
                  : // Show filtered suggestions
                    suggestions
                      .filter((suggestion) => suggestion.category === activeCategory && suggestion.is_active)
                      .map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all cursor-pointer min-w-0"
                          onClick={() => handleSuggestionClick(suggestion.name)}
                        >
                          <Image
                            src={suggestion.image || "/placeholder.svg?height=88&width=88&query=suggestion"}
                            alt={suggestion.name}
                            width={88}
                            height={88}
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized={true}
                            onError={(e) => {
                              // Fall back to a local placeholder with the suggestion name
                              e.currentTarget.src = `/placeholder.svg?height=88&width=88&query=${encodeURIComponent(suggestion.name)}`
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 sm:p-2 rounded-lg">
                            <span className="text-xs sm:text-sm font-medium text-white leading-tight line-clamp-2">
                              {suggestion.name}
                            </span>
                          </div>
                        </div>
                      ))}
              </div>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No suggestion categories available.</div>
          )}
        </div>

        {/* Number of Images */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Number of Images</h3>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {imageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedCount(option.value)}
                className={`flex flex-col items-center gap-1 px-3 md:px-6 py-2 md:py-3 rounded-lg transition-all ${
                  selectedCount === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-base md:text-lg font-semibold">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.tokens}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/20 border border-destructive text-destructive-foreground rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <div className="relative">
          <Button
            className="w-full py-6 text-lg bg-gradient-to-r from-[#6C47FF] to-[#FF4D8D] hover:opacity-90 text-white"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Image ({tokensRequired} tokens)
              </>
            )}
          </Button>
        </div>

        {/* View Collection Button */}
        {generatedImages.length > 0 && (
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={viewCollection}>
              <FolderOpen className="h-5 w-5 mr-2" />
              View Your Collection
            </Button>
          </div>
        )}
      </div>

      {/* Right Column - Generated Images */}
      <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Generated Images</h2>
          {generatedImages.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button variant="outline" size="sm" onClick={viewCollection}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Collection
              </Button>
            </div>
          )}
        </div>

        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="bg-card p-8 rounded-xl mb-4">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generating Images...</h3>
            <p className="text-muted-foreground max-w-md">
              This may take a few moments. We're creating your images based on the prompt.
            </p>
          </div>
        )}

        {!isGenerating && generatedImages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="bg-card p-8 rounded-xl mb-4">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Images Generated Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Enter a prompt and click the Generate button to create AI-generated images based on your description.
            </p>
          </div>
        )}

        {autoSaving && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 text-blue-300 rounded-lg flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Saving images to your collection...</span>
          </div>
        )}

        {!isGenerating && generatedImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer transform transition-transform hover:scale-[1.02]"
                onClick={() => handleImageClick(index)}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-card">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Generated image ${index + 1}`}
                    width={512}
                    height={512}
                    className="w-full h-full object-cover"
                    unoptimized // Important for external URLs
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening modal
                      handleDownload(image, index)
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent opening modal
                      handleShare(image)
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
                  Image {index + 1}
                </div>
                {/* Show saved indicator */}
                <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
                  Saved
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        images={generatedImages}
        initialIndex={selectedImageIndex}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDownload={handleDownload}
        onShare={handleShare}
        onSave={(index) => saveImageToCollection(generatedImages[index], index)}
        savingIndex={savingImageIndex}
      />
    </div>
  )
}
