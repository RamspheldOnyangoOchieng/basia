"use client"

import { useEffect, useState } from "react"
import { getAnonymousId } from "@/lib/anonymous-id"
import Image from "next/image"

interface GeneratedImage {
  id: string
  image_url: string
  prompt: string
  created_at: string
}

export default function CollectionsPage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        const anonymousId = getAnonymousId()

        const response = await fetch(`/api/user-images?anonymous_id=${anonymousId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch images")
        }

        const data = await response.json()
        setImages(data.images || [])
      } catch (err) {
        console.error("Error fetching images:", err)
        setError("Failed to load your image collection")
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Image Collection</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Image Collection</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Image Collection</h1>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium text-gray-600">No images saved yet</h2>
          <p className="mt-2 text-gray-500">Generate some images and save them to see them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image src={image.image_url || "/placeholder.svg"} alt={image.prompt} fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 line-clamp-2">{image.prompt}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(image.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
