"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Download,
  Trash2,
  ImageIcon,
  Plus,
  X,
  RefreshCw,
  Heart,
  MoreVertical,
  FolderPlus,
  Folder,
  CheckSquare,
  Square,
  CheckCircle,
  Circle,
} from "lucide-react"
import { getAllImages, deleteExistingImage, toggleImageFavorite } from "@/lib/image-actions"
import { getAllCollections, createNewCollection } from "@/lib/collection-actions"
import { addImageToExistingCollection } from "@/lib/image-actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface GeneratedImage {
  id: string
  prompt: string
  image_url: string
  created_at: string
  model_used: string
  tags?: string[]
  favorite?: boolean
  collection_id?: string
}

interface Collection {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  image_count: number
}

export default function CollectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isFavoriting, setIsFavoriting] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false)
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isAddingToCollection, setIsAddingToCollection] = useState(false)
  const [selectedImageForCollection, setSelectedImageForCollection] = useState<string | null>(null)

  // New state for multi-selection
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [showBulkAddToCollectionDialog, setShowBulkAddToCollectionDialog] = useState(false)

  const fetchImages = async () => {
    setIsLoading(true)
    try {
      const result = await getAllImages()
      if (result.success) {
        setImages(result.images)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "Failed to load your collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCollections = async () => {
    setIsLoadingCollections(true)
    try {
      const result = await getAllCollections()
      if (result.success) {
        setCollections(result.collections)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error fetching collections:", error)
      toast({
        title: "Error",
        description: "Failed to load collections. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCollections(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [toast])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchImages()
    setIsRefreshing(false)
    toast({
      title: "Collection refreshed",
      description: "Your image collection has been updated.",
    })
  }

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}.jpg`
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image from your collection?")) {
      return
    }

    setIsDeleting(id)
    try {
      const result = await deleteExistingImage(id)

      if (result.success) {
        setImages((prev) => prev.filter((img) => img.id !== id))
        toast({
          title: "Success",
          description: "Image deleted from your collection",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    setIsFavoriting(id)
    try {
      const result = await toggleImageFavorite(id, !isFavorite)

      if (result.success) {
        toast({
          title: "Success",
          description: !isFavorite ? "Added to favorites" : "Removed from favorites",
        })
        setImages(images.map((img) => (img.id === id ? { ...img, favorite: !isFavorite } : img)))
        if (selectedImage?.id === id) {
          setSelectedImage({ ...selectedImage, favorite: !isFavorite })
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFavoriting(null)
    }
  }

  const handleOpenAddToCollection = async (imageId: string) => {
    setSelectedImageForCollection(imageId)
    await fetchCollections()
    setShowAddToCollectionDialog(true)
  }

  const handleAddToCollection = async (collectionId: string) => {
    if (!selectedImageForCollection) return

    setIsAddingToCollection(true)
    try {
      const result = await addImageToExistingCollection(selectedImageForCollection, collectionId)

      if (result.success) {
        toast({
          title: "Success",
          description: "Image added to collection",
        })
        setShowAddToCollectionDialog(false)
        setSelectedImageForCollection(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error adding to collection:", error)
      toast({
        title: "Error",
        description: "Failed to add image to collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCollection(false)
    }
  }

  const handleCreateCollection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreatingCollection(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createNewCollection(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Collection created successfully",
        })
        setShowCreateCollectionDialog(false)

        // Refresh collections and add image to the new collection if we're in that flow
        await fetchCollections()

        if (selectedImageForCollection && result.collection) {
          await handleAddToCollection(result.collection.id)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create collection",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCollection(false)
    }
  }

  // New functions for multi-selection
  const toggleSelectImage = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()

    setSelectedImages((prev) => {
      const newSelection = new Set(prev)
      if (newSelection.has(id)) {
        newSelection.delete(id)
      } else {
        newSelection.add(id)
      }
      return newSelection
    })

    // If we're selecting the first image, enter selection mode
    if (selectedImages.size === 0) {
      setIsSelectionMode(true)
    }

    // If we've deselected all images, exit selection mode
    if (selectedImages.size === 1 && selectedImages.has(id)) {
      setIsSelectionMode(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      // If all are selected, deselect all
      setSelectedImages(new Set())
      setIsSelectionMode(false)
    } else {
      // Otherwise select all
      setSelectedImages(new Set(images.map((img) => img.id)))
      setIsSelectionMode(true)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return

    if (
      !confirm(
        `Are you sure you want to delete ${selectedImages.size} selected image${selectedImages.size > 1 ? "s" : ""}?`,
      )
    ) {
      return
    }

    setIsBulkDeleting(true)

    try {
      const deletePromises = Array.from(selectedImages).map((id) => deleteExistingImage(id))
      const results = await Promise.all(deletePromises)

      const failedCount = results.filter((r) => !r.success).length

      if (failedCount === 0) {
        setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)))
        toast({
          title: "Success",
          description: `${selectedImages.size} image${selectedImages.size > 1 ? "s" : ""} deleted successfully`,
        })
        setSelectedImages(new Set())
        setIsSelectionMode(false)
      } else {
        toast({
          title: "Partial success",
          description: `${selectedImages.size - failedCount} of ${selectedImages.size} images deleted. Some images failed to delete.`,
          variant: "destructive",
        })
        // Refresh to get accurate state
        await fetchImages()
      }
    } catch (error) {
      console.error("Error bulk deleting images:", error)
      toast({
        title: "Error",
        description: "Failed to delete some or all selected images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleBulkAddToCollection = async (collectionId: string) => {
    if (selectedImages.size === 0) return

    setIsAddingToCollection(true)

    try {
      const addPromises = Array.from(selectedImages).map((id) => addImageToExistingCollection(id, collectionId))

      const results = await Promise.all(addPromises)
      const failedCount = results.filter((r) => !r.success).length

      if (failedCount === 0) {
        toast({
          title: "Success",
          description: `${selectedImages.size} image${selectedImages.size > 1 ? "s" : ""} added to collection`,
        })
        setShowBulkAddToCollectionDialog(false)
      } else {
        toast({
          title: "Partial success",
          description: `${selectedImages.size - failedCount} of ${selectedImages.size} images added to collection. Some failed.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding images to collection:", error)
      toast({
        title: "Error",
        description: "Failed to add images to collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCollection(false)
    }
  }

  const handleOpenBulkAddToCollection = async () => {
    if (selectedImages.size === 0) return
    await fetchCollections()
    setShowBulkAddToCollectionDialog(true)
  }

  const cancelSelection = () => {
    setSelectedImages(new Set())
    setIsSelectionMode(false)
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Your Collection</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              {!isSelectionMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                  <Button
                    onClick={() => router.push("/collections")}
                    variant="outline"
                    size="sm"
                    className="bg-[#252525] border-[#333333]"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Collections
                  </Button>
                  <Button onClick={() => router.push("/generate")} className="bg-[#a55ebf] hover:bg-[#8f4da6]">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Images
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={cancelSelection}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenBulkAddToCollection}
                    className="bg-[#252525] border-[#333333]"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add to Collection
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                    {isBulkDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-sm flex items-center gap-2">
              {selectedImages.size === images.length ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  Select All
                </>
              )}
            </Button>
            {isSelectionMode && (
              <span className="text-sm text-gray-400">
                {selectedImages.size} of {images.length} selected
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#a55ebf]" />
        </div>
      ) : images.length === 0 ? (
        <Card className="bg-[#1A1A1A] border-[#252525]">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-[#252525] p-6 rounded-full mb-4">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Images Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Your collection is empty. Generate some images to see them here.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/generate")} className="bg-[#a55ebf] hover:bg-[#8f4da6]">
                Generate Images
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {images.map((image) => (
            <Card
              key={image.id}
              className={`bg-[#1A1A1A] border-[#252525] overflow-hidden transition-all ${
                selectedImages.has(image.id) ? "ring-2 ring-[#a55ebf] ring-offset-2 ring-offset-[#1A1A1A]" : ""
              }`}
            >
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => (isSelectionMode ? toggleSelectImage(image.id) : setSelectedImage(image))}
              >
                <Image
                  src={image.image_url || "/placeholder.svg"}
                  alt={image.prompt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Selection indicator */}
                <div
                  className={`absolute top-2 right-2 z-20 rounded-full bg-black/50 p-1 transition-opacity ${
                    isSelectionMode || selectedImages.has(image.id)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => toggleSelectImage(image.id, e)}
                >
                  {selectedImages.has(image.id) ? (
                    <CheckCircle className="h-5 w-5 text-[#a55ebf]" />
                  ) : (
                    <Circle className="h-5 w-5 text-white/70" />
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-gray-300 line-clamp-2 mb-3">{image.prompt}</p>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleFavorite(image.id, !!image.favorite)
                    }}
                    disabled={isFavoriting === image.id}
                    className="h-8 w-8 p-0 bg-[#252525] border-[#333333]"
                  >
                    {isFavoriting === image.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 ${image.favorite ? "fill-red-500 text-red-500" : ""}`} />
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(image.image_url, image.prompt)
                      }}
                      className="h-8 w-8 p-0 bg-[#252525] border-[#333333]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-[#252525] border-[#333333]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1A1A1A] border-[#252525]">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenAddToCollection(image.id)
                          }}
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Add to Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelectImage(image.id)
                          }}
                        >
                          {selectedImages.has(image.id) ? (
                            <>
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Deselect
                            </>
                          ) : (
                            <>
                              <Square className="h-4 w-4 mr-2" />
                              Select
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(image.id)
                          }}
                          disabled={isDeleting === image.id}
                          className="text-red-500"
                        >
                          {isDeleting === image.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-[95vw] bg-[#1A1A1A] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative aspect-square max-h-[80vh]">
              <Image
                src={selectedImage.image_url || "/placeholder.svg"}
                alt={selectedImage.prompt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="p-4 bg-[#1A1A1A]">
              <p className="text-sm text-gray-300 mb-4">{selectedImage.prompt}</p>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleToggleFavorite(selectedImage.id, !!selectedImage.favorite)}
                  disabled={isFavoriting === selectedImage.id}
                  className="bg-[#252525] border-[#333333]"
                >
                  {isFavoriting === selectedImage.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Heart className={`h-4 w-4 mr-2 ${selectedImage.favorite ? "fill-red-500 text-red-500" : ""}`} />
                  )}
                  {selectedImage.favorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOpenAddToCollection(selectedImage.id)}
                  className="bg-[#252525] border-[#333333]"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add to Collection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage.image_url, selectedImage.prompt)}
                  className="bg-[#252525] border-[#333333]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedImage.id)
                    setSelectedImage(null)
                  }}
                  disabled={isDeleting === selectedImage.id}
                  className="bg-[#252525] border-[#333333]"
                >
                  {isDeleting === selectedImage.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showAddToCollectionDialog} onOpenChange={setShowAddToCollectionDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#252525] w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingCollections ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-[#a55ebf]" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">You don't have any collections yet.</p>
                <Button
                  onClick={() => {
                    setShowAddToCollectionDialog(false)
                    setShowCreateCollectionDialog(true)
                  }}
                  className="bg-[#a55ebf] hover:bg-[#8f4da6]"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="outline"
                    className="w-full justify-start bg-[#252525] border-[#333333] hover:bg-[#333333]"
                    onClick={() => handleAddToCollection(collection.id)}
                    disabled={isAddingToCollection}
                  >
                    <Folder className="h-4 w-4 mr-2 text-[#a55ebf]" />
                    {collection.name}
                    <span className="ml-auto text-xs text-gray-400">
                      {collection.image_count} {collection.image_count === 1 ? "image" : "images"}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddToCollectionDialog(false)
                setShowCreateCollectionDialog(true)
              }}
              className="bg-[#252525] border-[#333333]"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddToCollectionDialog(false)}
              className="bg-[#252525] border-[#333333]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add to Collection Dialog */}
      <Dialog open={showBulkAddToCollectionDialog} onOpenChange={setShowBulkAddToCollectionDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#252525] w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add {selectedImages.size} Images to Collection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingCollections ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-[#a55ebf]" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-4">You don't have any collections yet.</p>
                <Button
                  onClick={() => {
                    setShowBulkAddToCollectionDialog(false)
                    setShowCreateCollectionDialog(true)
                  }}
                  className="bg-[#a55ebf] hover:bg-[#8f4da6]"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {collections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="outline"
                    className="w-full justify-start bg-[#252525] border-[#333333] hover:bg-[#333333]"
                    onClick={() => handleBulkAddToCollection(collection.id)}
                    disabled={isAddingToCollection}
                  >
                    <Folder className="h-4 w-4 mr-2 text-[#a55ebf]" />
                    {collection.name}
                    <span className="ml-auto text-xs text-gray-400">
                      {collection.image_count} {collection.image_count === 1 ? "image" : "images"}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkAddToCollectionDialog(false)
                setShowCreateCollectionDialog(true)
              }}
              className="bg-[#252525] border-[#333333]"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkAddToCollectionDialog(false)}
              className="bg-[#252525] border-[#333333]"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateCollectionDialog} onOpenChange={setShowCreateCollectionDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#252525] w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCollection}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Collection"
                  required
                  className="bg-[#252525] border-[#333333]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A collection of my favorite images"
                  className="bg-[#252525] border-[#333333]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateCollectionDialog(false)
                  if (selectedImageForCollection) {
                    setShowAddToCollectionDialog(true)
                  } else if (selectedImages.size > 0) {
                    setShowBulkAddToCollectionDialog(true)
                  }
                }}
                className="bg-[#252525] border-[#333333]"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingCollection} className="bg-[#a55ebf] hover:bg-[#8f4da6]">
                {isCreatingCollection ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FolderPlus className="h-4 w-4 mr-2" />
                )}
                Create Collection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
