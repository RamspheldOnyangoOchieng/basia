"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/lib/use-translations"
import { useAuth } from "@/components/auth-context"
import { Pencil, Save, X, Plus, Trash } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SiteFooter() {
  const { t } = useTranslations()
  const currentYear = new Date().getFullYear()
  const { user, isAdmin } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [footerData, setFooterData] = useState({
    companyName: t("general.siteName"),
    companyDescription: `${t("general.siteName")} powers immersive experiences that feel real, allowing users to generate images and create AI characters.`,
    contactAddress: "AI Character Explorer Inc.\n123 AI Boulevard, Suite 456\nSan Francisco, CA 94105",
    features: [
      { id: 1, title: "Generate Image", url: "/generate" },
      { id: 2, title: "Chat", url: "/chat" },
      { id: 3, title: "Create Character", url: "/characters" },
      { id: 4, title: "Gallery", url: "/collection" },
      { id: 5, title: "My AI", url: "/profile" },
    ],
    popular: [
      { id: 1, title: t("general.siteName"), url: "/" },
      { id: 2, title: "AI Girlfriend", url: "/characters?category=companion" },
      { id: 3, title: "AI Anime", url: "/characters?category=anime" },
      { id: 4, title: "AI Boyfriend", url: "/characters?category=companion" },
    ],
    legal: [{ id: 1, title: "Terms and Policies", url: "/terms" }],
    company: [{ id: 1, title: "We're hiring", url: "/careers" }],
  })
  const [tempData, setTempData] = useState(footerData)
  const supabase = createClientComponentClient()

  // Load footer data from database on component mount
  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const { data, error } = await supabase.from("footer_content").select("*").single()

        if (data && !error) {
          setFooterData(data.content)
          setTempData(data.content)
        }
      } catch (error) {
        console.error("Error loading footer data:", error)
      }
    }

    loadFooterData()
  }, [supabase])

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("footer_content").upsert({
        id: 1,
        content: tempData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setFooterData(tempData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving footer data:", error)
    }
  }

  const handleCancel = () => {
    setTempData(footerData)
    setIsEditing(false)
  }

  const handleAddItem = (section) => {
    setTempData((prev) => ({
      ...prev,
      [section]: [...prev[section], { id: Date.now(), title: "New Item", url: "/" }],
    }))
  }

  const handleRemoveItem = (section, id) => {
    setTempData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }))
  }

  const handleItemChange = (section, id, field, value) => {
    setTempData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }))
  }

  const handleTextChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="w-full bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 text-zinc-800 dark:text-white py-8 sm:py-10 md:py-12 mt-auto rounded-[2px] border border-gray-200 dark:border-zinc-800">
      {isAdmin && (
        <div className="container mx-auto px-4 md:px-6 py-2 flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <X size={16} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
            >
              <Pencil size={16} /> Edit Footer
            </button>
          )}
        </div>
      )}
      <div className="container mx-auto px-4 md:px-6">
        {/* Mobile Footer (1-column layout) */}
        <div className="md:hidden space-y-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-xl font-bold">
                {t("general.siteName")}
                <span className="text-primary">.</span>
              </h2>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {t("general.siteName")} powers immersive experiences that feel real, allowing users to generate images and
              create AI characters.
            </p>
          </div>

          {/* Accordion-style sections for mobile */}
          <div className="space-y-6">
            {/* Features Section */}
            <div className="space-y-3">
              <h3 className="text-base font-medium">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/generate"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  Generate Image
                </Link>
                <Link
                  href="/chat"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  Chat
                </Link>
                <Link
                  href="/characters"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  Create Character
                </Link>
                <Link
                  href="/collection"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  Gallery
                </Link>
              </div>
            </div>

            {/* Popular Section */}
            <div className="space-y-3">
              <h3 className="text-base font-medium">Popular</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/characters?category=companion"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  AI Girlfriend
                </Link>
                <Link
                  href="/characters?category=anime"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  AI Anime
                </Link>
                <Link
                  href="/characters?category=companion"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  AI Boyfriend
                </Link>
                <Link
                  href="/"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                >
                  {t("general.siteName")}
                </Link>
              </div>
            </div>

            {/* Legal and Company */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h3 className="text-base font-medium mb-2">Legal</h3>
                  <Link
                    href="/terms"
                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                  >
                    Terms and Policies
                  </Link>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">Company</h3>
                  <Link
                    href="/careers"
                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                  >
                    We&apos;re hiring
                  </Link>
                </div>
              </div>
            </div>

            {/* Social and Contact */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-base font-medium mb-2">Social</h3>
                  <div className="flex space-x-4">
                    <Link
                      href="https://discord.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                      <span className="sr-only">Discord</span>
                    </Link>
                    <Link
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                      <span className="sr-only">Twitter</span>
                    </Link>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">Contact</h3>
                  <address className="text-zinc-600 dark:text-zinc-400 text-xs not-italic">
                    AI Character Explorer Inc.
                    <br />
                    123 AI Boulevard
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Footer (4-column layout) */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.companyName}
                    onChange={(e) => handleTextChange("companyName", e.target.value)}
                    className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-full"
                  />
                ) : (
                  <>
                    Lovegirl.ai
                    <span className="text-primary">.</span>
                  </>
                )}
              </h2>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xs">
              {isEditing ? (
                <textarea
                  value={tempData.companyDescription}
                  onChange={(e) => handleTextChange("companyDescription", e.target.value)}
                  className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-full h-24"
                />
              ) : (
                tempData.companyDescription
              )}
            </p>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Contacts:</h3>
              <address className="text-zinc-600 dark:text-zinc-400 text-xs not-italic">
                {isEditing ? (
                  <textarea
                    value={tempData.contactAddress}
                    onChange={(e) => handleTextChange("contactAddress", e.target.value)}
                    className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-full h-24"
                  />
                ) : (
                  tempData.contactAddress.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                )}
              </address>
            </div>
          </div>

          {/* Features Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Features</h3>
            <ul className="space-y-3">
              {tempData.features.map((item) => (
                <li key={item.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange("features", item.id, "title", e.target.value)}
                        className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 flex-1"
                      />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleItemChange("features", item.id, "url", e.target.value)}
                        className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-20"
                        placeholder="URL"
                      />
                      <button
                        onClick={() => handleRemoveItem("features", item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
              {isEditing && (
                <li>
                  <button
                    onClick={() => handleAddItem("features")}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Popular Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Popular</h3>
            <ul className="space-y-3">
              {tempData.popular.map((item) => (
                <li key={item.id}>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange("popular", item.id, "title", e.target.value)}
                        className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 flex-1"
                      />
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => handleItemChange("popular", item.id, "url", e.target.value)}
                        className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-20"
                        placeholder="URL"
                      />
                      <button
                        onClick={() => handleRemoveItem("popular", item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                    >
                      {item.title}
                    </Link>
                  )}
                </li>
              ))}
              {isEditing && (
                <li>
                  <button
                    onClick={() => handleAddItem("popular")}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Legal and Company Columns */}
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-3">
                {tempData.legal.map((item) => (
                  <li key={item.id}>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange("legal", item.id, "title", e.target.value)}
                          className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 flex-1"
                        />
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleItemChange("legal", item.id, "url", e.target.value)}
                          className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-20"
                          placeholder="URL"
                        />
                        <button
                          onClick={() => handleRemoveItem("legal", item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={item.url}
                        className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
                {isEditing && (
                  <li>
                    <button
                      onClick={() => handleAddItem("legal")}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      <Plus size={16} /> Add Item
                    </button>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-3">
                {tempData.company.map((item) => (
                  <li key={item.id}>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange("company", item.id, "title", e.target.value)}
                          className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 flex-1"
                        />
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => handleItemChange("company", item.id, "url", e.target.value)}
                          className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 w-20"
                          placeholder="URL"
                        />
                        <button
                          onClick={() => handleRemoveItem("company", item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={item.url}
                        className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm transition-colors"
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
                {isEditing && (
                  <li>
                    <button
                      onClick={() => handleAddItem("company")}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      <Plus size={16} /> Add Item
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Social and Payment Methods - keep as is */}
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Social</h3>
              <div className="flex space-x-4">
                <Link
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                  </svg>
                  <span className="sr-only">Discord</span>
                </Link>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright and Payment Methods - Responsive for all devices */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-zinc-600 dark:text-zinc-400 text-xs text-center sm:text-left">
            © {currentYear} {t("general.siteName")}. All Rights Reserved -
            <Link href="/sitemap" className="hover:text-zinc-900 dark:hover:text-white ml-1 transition-colors">
              Sitemap
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Image src="/visa-logo.svg" alt="Visa" width={60} height={40} className="h-6 sm:h-8 w-auto" />
            <Image src="/mastercard-logo.svg" alt="Mastercard" width={60} height={40} className="h-6 sm:h-8 w-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
