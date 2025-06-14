"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-context"
import { useCharacters } from "@/components/character-context"
import {
  LogOut,
  Settings,
  Home,
  Users,
  ImageIcon,
  MessageSquare,
  BarChart,
  ArrowLeft,
  Wand2,
  Upload,
} from "lucide-react"
import { generateCharacterDescription, generateSystemPrompt, type GenerateCharacterParams } from "@/lib/openai"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CreateCharacterPage() {
  const { user, isLoading } = useAuth()
  const { addCharacter, uploadImage } = useCharacters()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add video upload functionality to the form state
  const [formData, setFormData] = useState({
    name: "",
    age: 25,
    image: "/placeholder.svg?height=400&width=300",
    videoUrl: "", // Add this field
    description: "",
    personality: "",
    occupation: "",
    hobbies: "",
    body: "Average",
    ethnicity: "Mixed",
    language: "English",
    relationship: "Single",
    systemPrompt: "",
    category: "anime", // Default category
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number.parseInt(value) || 18 : value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // Update the handleImageChange function to use the same approach
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the image
    try {
      setIsUploading(true)
      setError("")

      try {
        const imageUrl = await uploadImage(file)
        setFormData((prev) => ({ ...prev, image: imageUrl }))
      } catch (err) {
        console.error("Error uploading image:", err)

        // If the error is about Cloudinary, provide a helpful message
        if (err instanceof Error && err.message.includes("Cloudinary")) {
          setError(`Cloudinary error: ${err.message}`)
        } else {
          setError(`Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`)
        }

        // Keep the image preview even if upload failed
        setFormData((prev) => ({
          ...prev,
          image: imagePreview || "/placeholder.svg?height=400&width=300",
        }))
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      setError("Please enter a name before generating a description")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const params: GenerateCharacterParams = {
        name: formData.name,
        age: formData.age,
        occupation: formData.occupation,
        personality: formData.personality,
        interests: formData.hobbies,
      }

      const description = await generateCharacterDescription(params)
      setFormData((prev) => ({ ...prev, description }))
    } catch (err) {
      console.error("Error generating description:", err)
      setError("Failed to generate description. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateSystemPrompt = async () => {
    if (!formData.name || !formData.description) {
      setError("Please enter a name and description before generating a system prompt")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const systemPrompt = await generateSystemPrompt({
        name: formData.name,
        age: formData.age,
        description: formData.description,
        personality: formData.personality,
        occupation: formData.occupation,
        hobbies: formData.hobbies,
      })

      setFormData((prev) => ({ ...prev, systemPrompt }))
    } catch (err) {
      console.error("Error generating system prompt:", err)
      setError("Failed to generate system prompt. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.description || !formData.systemPrompt) {
      setError("Name, description, and system prompt are required")
      return
    }

    setIsSaving(true)

    try {
      await addCharacter(formData)
      router.push("/admin/dashboard/characters")
    } catch (err) {
      console.error("Error saving character:", err)
      setError(err instanceof Error ? err.message : "Failed to save character. Please try again.")
    } finally {
      setIsSaving(false)
    }
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
        {/* Admin Sidebar */}
        <div className="w-64 bg-[#1A1A1A] border-r border-[#252525] flex flex-col">
          <div className="p-4 border-b border-[#252525]">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/admin/dashboard")}>
                <Settings className="mr-2 h-5 w-5" />
                Site Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push("/admin/dashboard/users")}
              >
                <Users className="mr-2 h-5 w-5" />
                Users
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start bg-[#252525]"
                onClick={() => router.push("/admin/dashboard/characters")}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Characters
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ImageIcon className="mr-2 h-5 w-5" />
                Images
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart className="mr-2 h-5 w-5" />
                Analytics
              </Button>
            </div>
          </nav>

          <div className="p-4 border-t border-[#252525]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/login")}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => router.push("/admin/dashboard/characters")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold">Create New Character</h2>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="Character name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="age" className="block text-sm font-medium text-gray-300">
                        Age
                      </label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age.toString()}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="occupation" className="block text-sm font-medium text-gray-300">
                        Occupation
                      </label>
                      <Input
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="Character occupation"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="personality" className="block text-sm font-medium text-gray-300">
                        Personality
                      </label>
                      <Input
                        id="personality"
                        name="personality"
                        value={formData.personality}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Friendly, Outgoing, Shy"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hobbies" className="block text-sm font-medium text-gray-300">
                        Hobbies
                      </label>
                      <Input
                        id="hobbies"
                        name="hobbies"
                        value={formData.hobbies}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Reading, Hiking, Photography"
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Details</h3>

                    {/* Character Category Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Character Category</label>
                      <RadioGroup
                        value={formData.category}
                        onValueChange={handleCategoryChange}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="girls" id="girls" />
                          <Label htmlFor="girls" className="text-white">
                            Girls
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="anime" id="anime" />
                          <Label htmlFor="anime" className="text-white">
                            Anime
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="guys" id="guys" />
                          <Label htmlFor="guys" className="text-white">
                            Guys
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Character Image</label>
                      <div
                        className="relative aspect-square w-full max-w-[200px] bg-[#252525] rounded-lg overflow-hidden cursor-pointer"
                        onClick={handleImageClick}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Character preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full p-4">
                            <Upload className="h-8 w-8 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-400 text-center">
                              {isUploading ? "Uploading..." : "Click to upload image"}
                            </p>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add a video upload field after the image upload section */}
                    {/* Add this after the image upload section in the form */}
                    <div className="space-y-2">
                      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300">
                        Character Video URL (Optional)
                      </label>
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="https://example.com/character-video.mp4"
                      />
                      <p className="text-xs text-gray-400">
                        Add a URL to a short video that will play when users hover over this character.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="body" className="block text-sm font-medium text-gray-300">
                        Body Type
                      </label>
                      <Input
                        id="body"
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Athletic, Slim, Average"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-300">
                        Ethnicity
                      </label>
                      <Input
                        id="ethnicity"
                        name="ethnicity"
                        value={formData.ethnicity}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="Character ethnicity"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="language" className="block text-sm font-medium text-gray-300">
                        Language
                      </label>
                      <Input
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., English, Spanish, Mandarin"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="relationship" className="block text-sm font-medium text-gray-300">
                        Relationship Status
                      </label>
                      <Input
                        id="relationship"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleChange}
                        className="bg-[#252525] border-[#333] text-white"
                        placeholder="e.g., Single, Married, Complicated"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Generated Content */}
                <div className="space-y-4 pt-4 border-t border-[#252525]">
                  <h3 className="text-lg font-medium">AI Generated Content</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                        Character Description
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-[#FF4D8D] border-[#FF4D8D] hover:bg-[#FF4D8D]/10"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Generate Description"}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="bg-[#252525] border-[#333] text-white min-h-[100px]"
                      placeholder="A brief description of the character"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300">
                        System Prompt
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateSystemPrompt}
                        disabled={isGenerating}
                        className="text-[#FF4D8D] border-[#FF4D8D] hover:bg-[#FF4D8D]/10"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isGenerating ? "Generating..." : "Generate System Prompt"}
                      </Button>
                    </div>
                    <Textarea
                      id="systemPrompt"
                      name="systemPrompt"
                      value={formData.systemPrompt}
                      onChange={handleChange}
                      className="bg-[#252525] border-[#333] text-white min-h-[150px]"
                      placeholder="The system prompt that will guide the AI's responses as this character"
                    />
                    <p className="text-xs text-gray-400">
                      This prompt will instruct the AI on how to behave and respond as this character.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => router.push("/admin/dashboard/characters")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#FF4D8D] hover:bg-[#FF3D7D] text-white" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Create Character"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
